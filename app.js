const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');

const imageLoader = document.getElementById('imageLoader');
const topTextInput = document.getElementById('topText');
const bottomTextInput = document.getElementById('bottomText');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn'); 
const saveGalleryBtn = document.getElementById('saveGalleryBtn');
const deleteElementBtn = document.getElementById('deleteElementBtn');
const gallery = document.getElementById('gallery');

// 🛠️ Éléments de contrôle et de personnalisation
const textColorInput = document.getElementById('textColor');
const strokeColorInput = document.getElementById('strokeColor');
const textSizeInput = document.getElementById('textSize');
const sizeVal = document.getElementById('sizeVal');
const textAlignmentInput = document.getElementById('textAlignment');
const fontFamilyInput = document.getElementById('fontFamily');
const filterButtons = document.querySelectorAll('.btn-filter');
const stickerButtons = document.querySelectorAll('.btn-sticker');

let activeImage = null;
let currentFilter = 'none';

// Configuration des états des objets déplaçables (Drag Text & Stickers)
let textTop = { text: '', x: 250, y: 50, width: 0, height: 40 };
let textBottom = { text: '', x: 250, y: 450, width: 0, height: 40 };
let stickers = []; 

let selectedElement = null; // Cible actuelle ('top', 'bottom', ou { type: 'sticker', index: i })
let isDragging = false;

// 1. Gestion du chargement de l'image
imageLoader.addEventListener('change', handleImage, false);

function handleImage(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            activeImage = img;
            
            // Adapter la taille logique du canvas à l'image
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Activer tous les champs de saisie, boutons et options de style
            topTextInput.disabled = false;
            bottomTextInput.disabled = false;
            textColorInput.disabled = false;
            strokeColorInput.disabled = false;
            textSizeInput.disabled = false;
            textAlignmentInput.disabled = false;
            fontFamilyInput.disabled = false;
            downloadBtn.disabled = false;
            shareBtn.disabled = false; 
            saveGalleryBtn.disabled = false;
            filterButtons.forEach(btn => btn.disabled = false);
            stickerButtons.forEach(btn => btn.disabled = false);
            
            // Définir une taille de police initiale proportionnelle
            const defaultSize = Math.floor(canvas.width * 0.08);
            textSizeInput.value = defaultSize;
            sizeVal.textContent = defaultSize;

            // Réinitialiser les positions initiales des textes, sélection et vider les stickers
            textTop.x = canvas.width / 2; textTop.y = Math.floor(canvas.height * 0.1);
            textBottom.x = canvas.width / 2; textBottom.y = Math.floor(canvas.height * 0.9);
            stickers = []; 
            selectedElement = null;
            if (deleteElementBtn) deleteElementBtn.disabled = true;

            updateMeme();
        }
        img.src = event.target.result;
    }
    if(e.target.files[0]) {
        reader.readAsDataURL(e.target.files[0]);
    }
}

// 2. Moteur de rendu en temps réel
function updateMeme() {
    if (!activeImage) return;

    // Étape A : Appliquer le filtre et dessiner le fond
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = currentFilter;
    ctx.drawImage(activeImage, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none'; 

    // Étape B : Configuration des styles de texte
    const fontSize = textSizeInput.value;
    sizeVal.textContent = fontSize; 
    
    ctx.font = `bold ${fontSize}px ${fontFamilyInput.value || 'Impact'}, sans-serif`;
    ctx.fillStyle = textColorInput.value;
    ctx.strokeStyle = strokeColorInput.value;
    ctx.lineWidth = fontSize / 6;
    ctx.textAlign = textAlignmentInput.value || 'center';
    ctx.textBaseline = 'middle';

    // Rendu du texte du haut
    textTop.text = topTextInput.value.toUpperCase();
    textTop.height = parseInt(fontSize);
    if (textTop.text) {
        ctx.strokeText(textTop.text, textTop.x, textTop.y);
        ctx.fillText(textTop.text, textTop.x, textTop.y);
        textTop.width = ctx.measureText(textTop.text).width;
    }

    // Rendu du texte du bas
    textBottom.text = bottomTextInput.value.toUpperCase();
    textBottom.height = parseInt(fontSize);
    if (textBottom.text) {
        ctx.strokeText(textBottom.text, textBottom.x, textBottom.y);
        ctx.fillText(textBottom.text, textBottom.x, textBottom.y);
        textBottom.width = ctx.measureText(textBottom.text).width;
    }

    // Étape C : Rendu des Stickers / Émojis
    stickers.forEach(sticker => {
        ctx.font = `${sticker.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sticker.type, sticker.x, sticker.y);
    });

    // Étape D : Dessiner un contour de sélection autour de l'élément actif
    if (selectedElement) {
        ctx.strokeStyle = '#6c5ce7'; 
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]); 

        if (selectedElement === 'top' && textTop.text) {
            ctx.strokeRect(textTop.x - textTop.width / 2 - 10, textTop.y - textTop.height / 2 - 5, textTop.width + 20, textTop.height + 10);
        } else if (selectedElement === 'bottom' && textBottom.text) {
            ctx.strokeRect(textBottom.x - textBottom.width / 2 - 10, textBottom.y - textBottom.height / 2 - 5, textBottom.width + 20, textBottom.height + 10);
        } else if (selectedElement.type === 'sticker') {
            const s = stickers[selectedElement.index];
            if (s) {
                ctx.strokeRect(s.x - s.size / 2 - 5, s.y - s.size / 2 - 5, s.size + 10, s.size + 10);
            }
        }
        ctx.setLineDash([]); 
    }
}

// 📱 2.5 Fonction Responsive : Conversion des coordonnées Écran -> Canvas
function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else { 
        clientX = e.clientX;
        clientY = e.clientY;
    }

    return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
    };
}

// 3. Logique d'interaction et de déplacement (Souris + Tactile)
function handleStart(e) {
    if (!activeImage) return;
    if (e.type === 'touchstart' && e.target === canvas) e.preventDefault();

    const pos = getCoordinates(e);
    const mouseX = pos.x;
    const mouseY = pos.y;

    selectedElement = null;
    if (deleteElementBtn) deleteElementBtn.disabled = true;

    for (let i = stickers.length - 1; i >= 0; i--) {
        const s = stickers[i];
        if (Math.abs(mouseX - s.x) < s.size / 2 && Math.abs(mouseY - s.y) < s.size / 2) {
            selectedElement = { type: 'sticker', index: i };
            isDragging = true;
            if (deleteElementBtn) deleteElementBtn.disabled = false;
            updateMeme();
            return;
        }
    }

    if (textTop.text && mouseX > textTop.x - textTop.width / 2 && mouseX < textTop.x + textTop.width / 2 &&
        mouseY > textTop.y - textTop.height / 2 && mouseY < textTop.y + textTop.height / 2) {
        selectedElement = 'top';
        isDragging = true;
        if (deleteElementBtn) deleteElementBtn.disabled = false;
        updateMeme();
        return;
    }

    if (textBottom.text && mouseX > textBottom.x - textBottom.width / 2 && mouseX < textBottom.x + textBottom.width / 2 &&
        mouseY > textBottom.y - textBottom.height / 2 && mouseY < textBottom.y + textBottom.height / 2) {
        selectedElement = 'bottom';
        isDragging = true;
        if (deleteElementBtn) deleteElementBtn.disabled = false;
        updateMeme();
        return;
    }

    updateMeme(); 
}

function handleMove(e) {
    if (!isDragging || !selectedElement) return;
    if (e.cancelable) e.preventDefault();

    const pos = getCoordinates(e);
    const mouseX = pos.x;
    const mouseY = pos.y;

    if (selectedElement === 'top') {
        textTop.x = mouseX; textTop.y = mouseY;
    } else if (selectedElement === 'bottom') {
        textBottom.x = mouseX; textBottom.y = mouseY;
    } else if (selectedElement.type === 'sticker') {
        stickers[selectedElement.index].x = mouseX;
        stickers[selectedElement.index].y = mouseY;
    }
    updateMeme();
}

const stopDragging = () => { isDragging = false; };

canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', stopDragging);
canvas.addEventListener('mouseleave', stopDragging);

canvas.addEventListener('touchstart', handleStart, { passive: false });
canvas.addEventListener('touchmove', handleMove, { passive: false });
canvas.addEventListener('touchend', stopDragging);
canvas.addEventListener('touchcancel', stopDragging);

// ⚡ Écouteurs d'événements pour appliquer les styles en direct
topTextInput.addEventListener('input', updateMeme);
bottomTextInput.addEventListener('input', updateMeme);
textColorInput.addEventListener('input', updateMeme);
strokeColorInput.addEventListener('input', updateMeme);
textSizeInput.addEventListener('input', updateMeme);
textAlignmentInput.addEventListener('change', updateMeme);
fontFamilyInput.addEventListener('change', updateMeme);

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.getAttribute('data-filter');
        updateMeme();
    });
});

stickerButtons.forEach(button => {
    button.addEventListener('click', () => {
        const type = button.getAttribute('data-sticker');
        stickers.push({
            type: type,
            x: canvas.width / 2,
            y: canvas.height / 2,
            size: Math.floor(canvas.width * 0.12)
        });
        selectedElement = { type: 'sticker', index: stickers.length - 1 };
        if (deleteElementBtn) deleteElementBtn.disabled = false;
        updateMeme();
    });
});

// 4. Téléchargement du mème
downloadBtn.addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    link.download = 'mon-meme.jpeg';
    link.href = dataURL;
    link.click();
});

// 5. Gestion de la galerie (Sauvegarde locale enrichie pour édition/suppression)
saveGalleryBtn.addEventListener('click', () => {
    if (!activeImage) return;

    const finalImageURL = canvas.toDataURL('image/jpeg');
    
    const newMeme = {
        id: Date.now(), 
        thumbnail: finalImageURL,
        textTop: { ...textTop },
        textBottom: { ...textBottom },
        stickers: JSON.parse(JSON.stringify(stickers)), 
        currentFilter: currentFilter,
        textSize: textSizeInput.value,
        textColor: textColorInput.value,
        strokeColor: strokeColorInput.value,
        fontFamily: fontFamilyInput.value,
        textAlignment: textAlignmentInput.value,
        bgSrc: activeImage.src 
    };

    let savedMemes = JSON.parse(localStorage.getItem('myMemes')) || [];
    savedMemes.unshift(newMeme);
    localStorage.setItem('myMemes', JSON.stringify(savedMemes));
    
    renderGallery(savedMemes);
    alert('Mème sauvegardé dans la galerie !');
});

// 6. Fonction pour afficher les mèmes avec boutons Éditer et Supprimer
function renderGallery(memesList) {
    gallery.innerHTML = '';

    if (memesList.length === 0) {
        gallery.innerHTML = '<p class="empty-msg">Aucun mème créé pour le moment. Lancez-vous !</p>';
        return;
    }

    memesList.forEach(meme => {
        const galleryItem = document.createElement('div');
        galleryItem.classList.add('gallery-item');
        galleryItem.style.position = 'relative';
        
        const img = document.createElement('img');
        img.src = meme.thumbnail;
        
        const actionOverlay = document.createElement('div');
        actionOverlay.className = 'gallery-actions';
        actionOverlay.style.display = 'flex';
        actionOverlay.style.gap = '5px';
        actionOverlay.style.padding = '8px';
        actionOverlay.style.background = '#f1f2f6';

        const editBtn = document.createElement('button');
        editBtn.innerHTML = 'Éditer';
        editBtn.className = 'btn-filter active'; 
        editBtn.style.fontSize = '0.75rem';
        editBtn.style.padding = '5px 10px';
        editBtn.addEventListener('click', () => loadMemeToEditor(meme));

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = 'Supprimer';
        deleteBtn.className = 'btn-filter';
        deleteBtn.style.fontSize = '0.75rem';
        deleteBtn.style.padding = '5px 10px';
        deleteBtn.style.backgroundColor = '#ff7675';
        deleteBtn.style.color = 'white';
        deleteBtn.addEventListener('click', () => deleteMemeFromGallery(meme.id));

        actionOverlay.appendChild(editBtn);
        actionOverlay.appendChild(deleteBtn);
        
        galleryItem.appendChild(img);
        galleryItem.appendChild(actionOverlay);
        gallery.appendChild(galleryItem);
    });
}

// 6.5 Logique de réédition et de suppression
function loadMemeToEditor(meme) {
    const img = new Image();
    img.onload = function() {
        activeImage = img;
        canvas.width = img.width;
        canvas.height = img.height;

        topTextInput.disabled = false;
        bottomTextInput.disabled = false;
        textColorInput.disabled = false;
        strokeColorInput.disabled = false;
        textSizeInput.disabled = false;
        textAlignmentInput.disabled = false;
        fontFamilyInput.disabled = false;
        downloadBtn.disabled = false;
        shareBtn.disabled = false; 
        saveGalleryBtn.disabled = false;
        filterButtons.forEach(btn => btn.disabled = false);
        stickerButtons.forEach(btn => btn.disabled = false);

        topTextInput.value = meme.textTop.text;
        bottomTextInput.value = meme.textBottom.text;
        textSizeInput.value = meme.textSize;
        textColorInput.value = meme.textColor;
        strokeColorInput.value = meme.strokeColor;
        fontFamilyInput.value = meme.fontFamily;
        textAlignmentInput.value = meme.textAlignment;
        currentFilter = meme.currentFilter;

        filterButtons.forEach(btn => {
            if(btn.getAttribute('data-filter') === currentFilter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        textTop = { ...meme.textTop };
        textBottom = { ...meme.textBottom };
        stickers = JSON.parse(JSON.stringify(meme.stickers));
        selectedElement = null;

        updateMeme();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    img.src = meme.bgSrc;
}

function deleteMemeFromGallery(memeId) {
    if (confirm('Voulez-vous vraiment supprimer ce mème de votre galerie ?')) {
        let savedMemes = JSON.parse(localStorage.getItem('myMemes')) || [];
        savedMemes = savedMemes.filter(meme => meme.id !== memeId);
        localStorage.setItem('myMemes', JSON.stringify(savedMemes));
        renderGallery(savedMemes);
    }
}

function loadGalleryFromLocalStorage() {
    const savedMemes = JSON.parse(localStorage.getItem('myMemes')) || [];
    renderGallery(savedMemes);
}

// 7. Partage sur les réseaux sociaux (Web Share API)
shareBtn.addEventListener('click', () => {
    canvas.toBlob((blob) => {
        if (!blob) {
            alert("Erreur lors de la préparation de l'image.");
            return;
        }

        const file = new File([blob], 'meme.jpg', { type: 'image/jpeg' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
                files: [file],
                title: 'Mon Mème',
                text: 'Regarde le mème que je viens de générer !'
            })
            .catch((error) => {
                if (error.name !== 'AbortError') console.error('Erreur lors du partage :', error);
            });
        } else {
            alert("Le partage de fichiers n'est pas pris en charge par ce navigateur.");
        }
    }, 'image/jpeg');
});

// 8. Fonctionnalité de Suppression de l'élément sélectionné au clavier/bouton
function deleteCurrentElement() {
    if (!selectedElement) return;

    if (selectedElement === 'top') {
        topTextInput.value = ''; 
        textTop.text = '';
    } else if (selectedElement === 'bottom') {
        bottomTextInput.value = '';
        textBottom.text = '';
    } else if (selectedElement.type === 'sticker') {
        stickers.splice(selectedElement.index, 1);
    }

    selectedElement = null;
    if (deleteElementBtn) deleteElementBtn.disabled = true;
    updateMeme();
}

if (deleteElementBtn) {
    deleteElementBtn.addEventListener('click', deleteCurrentElement);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement !== topTextInput && document.activeElement !== bottomTextInput) {
            deleteCurrentElement();
        }
    }
});

document.addEventListener('DOMContentLoaded', loadGalleryFromLocalStorage);
