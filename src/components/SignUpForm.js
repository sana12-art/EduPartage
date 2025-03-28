import React, { useState } from "react"; // Importation de React et du hook useState pour gérer l'état local
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"; // Importation des fonctions Firebase pour créer un utilisateur et mettre à jour son profil
import { auth } from "../services/firebaseConfig"; // Importation de l'instance d'authentification Firebase
import { Link, useNavigate } from "react-router-dom"; // Importation des composants Link et useNavigate de react-router-dom pour la gestion de la navigation

const SignUpForm = () => {
  // Déclaration des états pour le prénom, nom, email, mot de passe et erreur
  const [firstName, setFirstName] = useState(""); 
  const [lastName, setLastName] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Gérer l'affichage des erreurs
  const navigate = useNavigate(); // Hook useNavigate pour gérer la redirection après inscription

  // Fonction qui gère l'envoi du formulaire d'inscription
  const handleSignUp = async (e) => {
    e.preventDefault(); // Empêche le comportement par défaut de la soumission du formulaire (rechargement de la page)
    try {
      // Création de l'utilisateur avec l'email et le mot de passe via Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Mise à jour du profil de l'utilisateur avec son prénom et son nom
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`, // Combinaison du prénom et du nom pour le champ displayName de l'utilisateur
      });

      setError(""); // Réinitialisation de l'erreur en cas de succès
      console.log("Utilisateur inscrit :", user); // Affichage de l'utilisateur inscrit dans la console pour débogage
      navigate("/home"); // Redirection vers la page d'accueil après inscription
    } catch (err) {
      setError("Erreur d'inscription : " + err.message); // En cas d'erreur, affichage de l'erreur
    }
  };

  return (
    <div>
      <h3>Inscription</h3>

      {/* Affichage de l'erreur si elle existe */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSignUp}>
        {/* Champ pour le prénom */}
        <input
          type="text"
          placeholder="Prénom"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)} // Mise à jour de l'état du prénom
          required
        />
        {/* Champ pour le nom */}
        <input
          type="text"
          placeholder="Nom"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)} // Mise à jour de l'état du nom
          required
        />
        {/* Champ pour l'email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Mise à jour de l'état de l'email
          required
        />
        {/* Champ pour le mot de passe */}
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Mise à jour de l'état du mot de passe
          required
        />
        {/* Bouton de soumission */}
        <button type="submit">S'inscrire</button>
      </form>

      {/* Lien vers la page de connexion si l'utilisateur a déjà un compte */}
      <p>Déjà un compte ? <Link to="/">Se connecter</Link></p>
    </div>
  );
};

export default SignUpForm;
