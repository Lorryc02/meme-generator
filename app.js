const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');

const imageLoader = document.getElementById('imageLoader');
const topTextInput = document.getElementById('topText');
const bottomTextInput = document.getElementById('bottomText');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn'); 
const saveGalleryBtn = document.getElementById('saveGalleryBtn');
const deleteElementBtn = document.getElementById('deleteElementBtn'); // 🆕 Bouton supprimer
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
let stickers = []; // Contiendra les éléments sous la forme : { type: '😎', x: 250, y: 250, size: 60 }

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
            
            // Adapter la taille du canvas à l'image
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

// 2. Moteur de rendu en temps réel (Image, Filtres, Textes, Stickers et Focus)
function updateMeme() {
    if (!activeImage) return;

    // Étape A : Appliquer le filtre et dessiner le fond
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = currentFilter;
    ctx.drawImage(activeImage, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none'; // Désactiver le filtre pour ne pas impacter les textes et émojis

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

    // 🆕 Étape D : Dessiner un contour de sélection autour de l'élément actif
    if (selectedElement) {
        ctx.strokeStyle = '#6c5ce7'; // Couleur principale violette
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]); // Lignes en pointillés

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
        ctx.setLineDash([]); // Réinitialisation
    }
}

// 3. Logique d'interaction et de déplacement à la souris (Drag & Drop)
canvas.addEventListener('mousedown', (e) => {
    if (!activeImage) return;
    const rect = canvas.getBoundingClientRect();
    
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    selectedElement = null;
    if (deleteElementBtn) deleteElementBtn.disabled = true;

    // Détection des clics sur les stickers (priorité au premier plan)
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

    // Détection du clic sur le texte du haut
    if (textTop.text && mouseX > textTop.x - textTop.width / 2 && mouseX < textTop.x + textTop.width / 2 &&
        mouseY > textTop.y - textTop.height / 2 && mouseY < textTop.y + textTop.height / 2) {
        selectedElement = 'top';
        isDragging = true;
        if (deleteElementBtn) deleteElementBtn.disabled = false;
        updateMeme();
        return;
    }

    // Détection du clic sur le texte du bas
    if (textBottom.text && mouseX > textBottom.x - textBottom.width / 2 && mouseX < textBottom.x + textBottom.width / 2 &&
        mouseY > textBottom.y - textBottom.height / 2 && mouseY < textBottom.y + textBottom.height / 2) {
        selectedElement = 'bottom';
        isDragging = true;
        if (deleteElementBtn) deleteElementBtn.disabled = false;
        updateMeme();
        return;
    }

    updateMeme(); // Permet d'effacer le cadre si on clique sur le fond vide
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging || !selectedElement) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (selectedElement === 'top') {
        textTop.x = mouseX; textTop.y = mouseY;
    } else if (selectedElement === 'bottom') {
        textBottom.x = mouseX; textBottom.y = mouseY;
    } else if (selectedElement.type === 'sticker') {
        stickers[selectedElement.index].x = mouseX;
        stickers[selectedElement.index].y = mouseY;
    }
    updateMeme();
});

// Mise à jour : on garde l'élément sélectionné au relâchement pour pouvoir le supprimer
const stopDragging = () => { isDragging = false; };
canvas.addEventListener('mouseup', stopDragging);
canvas.addEventListener('mouseleave', stopDragging);

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
        // Sélectionne automatiquement le nouveau sticker ajouté
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

// 5. Gestion de la galerie (Sauvegarde synchronisée avec $_POST de PHP)
saveGalleryBtn.addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/jpeg');
    
    const params = new URLSearchParams();
    params.append('image', dataURL);

    fetch('save_meme.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur réseau lors de la communication avec le serveur.');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            const emptyMsg = gallery.querySelector('.empty-msg');
            if (emptyMsg) emptyMsg.remove();

            const galleryItem = document.createElement('div');
            galleryItem.classList.add('gallery-item');
            
            const img = document.createElement('img');
            img.src = data.filePath;
            
            galleryItem.appendChild(img);
            gallery.prepend(galleryItem);
            
            alert('Mème enregistré avec succès en base de données !');
        } else {
            alert('Erreur serveur : ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Impossible de sauvegarder le mème. Vérifie XAMPP et la configuration de la BDD.');
    });
});

// 6. Chargement initial de la galerie depuis la table MySQL
function loadGalleryFromDatabase() {
    fetch('get_memes.php')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.memes.length > 0) {
            const emptyMsg = gallery.querySelector('.empty-msg');
            if (emptyMsg) emptyMsg.remove();

            data.memes.forEach(meme => {
                const galleryItem = document.createElement('div');
                galleryItem.classList.add('gallery-item');
                
                const img = document.createElement('img');
                img.src = meme.file_path;
                
                galleryItem.appendChild(img);
                gallery.appendChild(galleryItem);
            });
        }
    })
    .catch(error => console.error('Erreur lors du chargement de la galerie :', error));
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
                if (error.name !== 'AbortError') {
                    console.error('Erreur lors du partage :', error);
                }
            });
        } else {
            alert("Le partage de fichiers n'est pas pris en charge par ce navigateur. Télécharge ton mème pour le publier !");
        }
    }, 'image/jpeg');
});

// 🆕 8. Fonctionnalité de Suppression de l'élément sélectionné
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

// Écouteur du clic sur le bouton rouge
if (deleteElementBtn) {
    deleteElementBtn.addEventListener('click', deleteCurrentElement);
}

// Écouteur des touches "Delete" ou "Backspace" du clavier physique
document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
        // Ne supprime pas si l'utilisateur est en train de taper dans un des inputs textuels
        if (document.activeElement !== topTextInput && document.activeElement !== bottomTextInput) {
            deleteCurrentElement();
        }
    }
});

// Exécuter le chargement de l'historique BDD au chargement de la page
document.addEventListener('DOMContentLoaded', loadGalleryFromDatabase);