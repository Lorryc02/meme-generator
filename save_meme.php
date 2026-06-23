<?php
header('Content-Type: application/json');

// On vérifie que la requête est bien un POST et que l'image est présente
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['image'])) {
    $rawData = $_POST['image'];
    
    // On nettoie la chaîne Base64 renvoyée par le Canvas HTML5
    $filteredData = explode(',', $rawData);
    $base64Image = $filteredData[1];
    
    // On décode la chaîne pour la transformer en fichier image binaire
    $decodedData = base64_decode($base64Image);
    
    // On s'assure que le dossier 'uploads' existe, sinon on le crée
    if (!is_dir('uploads')) {
        mkdir('uploads', 0777, true);
    }
    
    // On génère un nom unique pour le mème (ex: meme_6678af3a1b2c4.jpg)
    $fileName = 'meme_' . uniqid() . '.jpg';
    $filePath = 'uploads/' . $fileName;
    
    // On sauvegarde le fichier sur le serveur local
    if (file_put_contents($filePath, $decodedData)) {
        echo json_encode([
            'success' => true,
            'message' => 'Mème sauvegardé avec succès !',
            'filePath' => $filePath
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de l\'écriture du fichier.'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Requête invalide.'
    ]);
}