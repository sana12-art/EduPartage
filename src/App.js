import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom"; // Importation des composants de React Router pour gérer la navigation
import { onAuthStateChanged } from "firebase/auth"; // Importation de la fonction Firebase pour écouter l'état d'authentification
import { auth } from "./services/firebaseConfig"; // Importation de l'instance d'authentification Firebase
import LoginForm from "./components/LoginForm"; // Formulaire de connexion
import SignUpForm from "./components/SignUpForm"; // Formulaire d'inscription
import HomePage from './components/HomePage'; // Page d'accueil de l'application

// Composant Home pour la page d'accueil
const Home = () => {
  const navigate = useNavigate(); // Accès à la fonction de navigation

  // Utilisation de useEffect pour vérifier l'état de l'authentification à chaque fois que le composant est monté
  useEffect(() => {
    // Surveille l'état de l'utilisateur connecté et redirige si l'utilisateur n'est pas connecté
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/"); // Redirige vers la page de connexion si l'utilisateur n'est pas authentifié
      }
    });

    // Nettoyage de l'abonnement à l'état d'authentification lors du démontage du composant
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div>
      <h1>Bienvenue sur la page d'accueil</h1>
      <button onClick={() => auth.signOut()}>Se déconnecter</button>
    </div>
  );
};

// Composant principal de l'application
function App() {
  const [user, setUser] = useState(null); // Etat pour stocker l'utilisateur connecté

  // Utilisation de useEffect pour vérifier l'état de l'utilisateur à chaque fois que le composant est monté
  useEffect(() => {
    // Surveille l'état d'authentification de l'utilisateur et met à jour l'état en conséquence
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Met à jour l'état 'user' avec l'utilisateur actuel ou null
      console.log("Utilisateur connecté :", currentUser); // Log l'utilisateur pour le débogage
    });

    // Nettoyage de l'abonnement à l'état d'authentification lors du démontage du composant
    return () => unsubscribe();
  }, []);

  return (
    <Router> 
      {/* Définition des routes de l'application */}
      <Routes>
        {/* Route pour la page d'accueil, visible uniquement si l'utilisateur est connecté */}
        <Route path="/" element={user ? <Home /> : <LoginForm />} />
        {/* Route pour le formulaire d'inscription */}
        <Route path="/signup" element={<SignUpForm />} />
        {/* Route pour la page d'accueil après la connexion */}
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
