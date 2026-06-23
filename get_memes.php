<?php
header('Content-Type: application/json');

$host = 'localhost';
$db   = 'meme_generator';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Récupérer tous les mèmes du plus récent au plus ancien
    $stmt = $pdo->query("SELECT file_path FROM memes ORDER BY created_at DESC");
    $memes = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'memes' => $memes
    ]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur : ' . $e->getMessage()]);
}