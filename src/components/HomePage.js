import React, { useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import './HomePage.css';

const HomePage = () => {
  const [title, setTitle] = useState(''); 
  const [url, setUrl] = useState(''); 
  const [resources, setResources] = useState([]); 
  const [filteredResources, setFilteredResources] = useState([]); 
  const [error, setError] = useState(''); 
  const [user, setUser] = useState(null); 
  const [confirmDelete, setConfirmDelete] = useState(false); 
  const [resourceToDelete, setResourceToDelete] = useState(null); 
  const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche pour filtrer les ressources

  // Hook useEffect pour gérer l'état de l'utilisateur
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        setUser(user); // Si l'utilisateur est authentifié, on met à jour l'état
      } else {
        window.location.href = '/login'; // Sinon, redirection vers la page de login
      }
    });
    return () => unsubscribe(); // Nettoyage de l'abonnement à l'authentification
  }, []);

  // Hook useEffect pour récupérer les ressources de l'utilisateur authentifié
  useEffect(() => {
    if (user) {
      const fetchResources = async () => {
        const querySnapshot = await getDocs(collection(db, 'resources')); // Récupérer toutes les ressources de la collection
        const resourcesList = querySnapshot.docs
          .filter(doc => doc.data().userId === user.uid) // Filtrer les ressources en fonction de l'ID de l'utilisateur
          .map(doc => ({ ...doc.data(), id: doc.id })); // Ajouter l'ID de chaque ressource
        setResources(resourcesList); // Mettre à jour la liste des ressources
        setFilteredResources(resourcesList); // Initialement, toutes les ressources sont affichées
      };
      fetchResources();
    }
  }, [user]); // Dépendance à l'utilisateur, donc les ressources se mettent à jour quand l'utilisateur change

  // Fonction de recherche des ressources
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value); // Mettre à jour l'état du terme de recherche

    // Filtrer les ressources en fonction du terme de recherche
    if (value) {
      const filtered = resources.filter(resource =>
        resource.title.toLowerCase().includes(value.toLowerCase()) || // Recherche par titre
        resource.url.toLowerCase().includes(value.toLowerCase()) // Recherche par URL
      );
      setFilteredResources(filtered); // Mettre à jour la liste filtrée
    } else {
      setFilteredResources(resources); // Si aucun terme de recherche, afficher toutes les ressources
    }
  };

  // Fonction pour ajouter une ressource
  const handleAddResource = async (e) => {
    e.preventDefault(); // Empêcher le rechargement de la page lors de la soumission du formulaire

    if (!title || !url) { // Vérification des champs obligatoires
      setError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      // Ajouter la ressource dans Firebase
      const docRef = await addDoc(collection(db, 'resources'), {
        title,
        url,
        createdAt: new Date(),
        userId: user.uid, // Associer la ressource à l'utilisateur authentifié
      });
      // Réinitialiser les champs et l'erreur
      setTitle('');
      setUrl('');
      setError('');
      // Mettre à jour la liste des ressources
      setResources(prevResources => [
        ...prevResources,
        { id: docRef.id, title, url, createdAt: new Date() },
      ]);
      setFilteredResources(prevResources => [
        ...prevResources,
        { id: docRef.id, title, url, createdAt: new Date() },
      ]);
    } catch (err) {
      setError('Erreur lors de l\'ajout de la ressource.');
      console.error(err); // Afficher l'erreur dans la console
    }
  };

  // Fonction pour demander la suppression d'une ressource
  const handleDeleteRequest = (id) => {
    setConfirmDelete(true);
    setResourceToDelete(id); // Sauvegarder l'ID de la ressource à supprimer
  };

  // Fonction pour annuler la suppression
  const handleCancelDelete = () => {
    setConfirmDelete(false);
    setResourceToDelete(null); // Réinitialiser l'ID de la ressource à supprimer
  };

  // Fonction pour supprimer une ressource
  const handleDeleteResource = async () => {
    try {
      // Supprimer la ressource de Firebase
      await deleteDoc(doc(db, 'resources', resourceToDelete));
      // Mettre à jour la liste des ressources après suppression
      setResources(resources.filter(resource => resource.id !== resourceToDelete));
      setFilteredResources(filteredResources.filter(resource => resource.id !== resourceToDelete));
      setConfirmDelete(false); // Fermer la fenêtre de confirmation
      setResourceToDelete(null); // Réinitialiser l'ID de la ressource supprimée
    } catch (err) {
      setError('Erreur lors de la suppression de la ressource.');
      console.error(err); // Afficher l'erreur dans la console
    }
  };

  return (
    <div>
      <h3>Page d'accueil</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Affichage des erreurs */}

      {/* Formulaire d'ajout de ressource */}
      <h4>Ajouter une ressource</h4>
      <form onSubmit={handleAddResource}>
        <input
          type="text"
          placeholder="Titre de la ressource"
          value={title}
          onChange={(e) => setTitle(e.target.value)} // Mettre à jour le titre de la ressource
          required
        />
        <input
          type="url"
          placeholder="URL de la ressource"
          value={url}
          onChange={(e) => setUrl(e.target.value)} // Mettre à jour l'URL de la ressource
          required
        />
        <button type="submit">Ajouter la ressource</button>
      </form>

      {/* Champ de recherche */}
      <h4>Rechercher des ressources</h4>
      <input
        type="text"
        placeholder="Rechercher par titre ou URL"
        value={searchTerm}
        onChange={handleSearchChange} // Mettre à jour les résultats de recherche
      />

      {/* Liste des ressources */}
      <h4>Ressources</h4>
      <ul>
        {filteredResources.map((resource) => (
          <li key={resource.id}>
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              {resource.title} {/* Afficher le titre de la ressource */}
            </a>
            <button onClick={() => handleDeleteRequest(resource.id)}>Supprimer</button> {/* Bouton de suppression */}
          </li>
        ))}
      </ul>

      {/* Modal de confirmation pour la suppression */}
      {confirmDelete && (
        <div className="confirmation-modal">
          <p>Êtes-vous sûr de vouloir supprimer cette ressource ?</p>
          <button onClick={handleDeleteResource}>Oui, supprimer</button>
          <button onClick={handleCancelDelete}>Annuler</button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
