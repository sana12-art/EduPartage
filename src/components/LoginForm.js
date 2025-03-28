import React, { useState } from "react"; // Importation de React et du hook useState pour gérer l'état local
import { signInWithEmailAndPassword } from "firebase/auth"; // Importation de la méthode pour connecter l'utilisateur avec son email et mot de passe depuis Firebase Auth
import { auth } from "../services/firebaseConfig"; // Importation de l'instance d'authentification Firebase
import { Link, useNavigate } from "react-router-dom"; // Importation des composants Link et useNavigate de react-router-dom pour la gestion de la navigation

const LoginForm = () => {
  const [email, setEmail] = useState(""); // Déclaration de l'état pour l'email de l'utilisateur
  const [password, setPassword] = useState(""); // Déclaration de l'état pour le mot de passe de l'utilisateur
  const [error, setError] = useState(""); // Déclaration de l'état pour afficher les erreurs de connexion
  const navigate = useNavigate(); // Hook useNavigate pour gérer la redirection après une connexion réussie

  // Fonction qui gère l'envoi du formulaire de connexion
  const handleLogin = async (e) => {
    e.preventDefault(); // Empêche le comportement par défaut de la soumission du formulaire (rechargement de la page)
    try {
      // Tentative de connexion avec l'email et le mot de passe via Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      setError(""); // Réinitialisation de l'erreur si la connexion est réussie
      navigate('/home'); // Redirection vers la page d'accueil après la connexion réussie
    } catch (err) {
      setError("Erreur de connexion : " + err.message); // Si une erreur se produit, on la capture et on l'affiche
    }
  };

  return (
    <div>
      <h3>Connexion</h3>
      {/* Affichage de l'erreur si elle existe */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        {/* Champ pour l'email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Mise à jour de l'état de l'email lorsqu'il change
          required
        />
        {/* Champ pour le mot de passe */}
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Mise à jour de l'état du mot de passe lorsqu'il change
          required
        />
        {/* Bouton de soumission */}
        <button type="submit">Se connecter</button>
      </form>
      {/* Lien vers la page d'inscription si l'utilisateur n'a pas encore de compte */}
      <p>Pas encore de compte ? <Link to="/signup">Créer un compte</Link></p>
    </div>
  );
};

export default LoginForm;
