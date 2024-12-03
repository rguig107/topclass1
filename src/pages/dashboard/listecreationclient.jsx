import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Input,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Select,
  Textarea,
  Button,
  Option,
} from "@material-tailwind/react";
import { EyeIcon, PencilIcon, TrashIcon, CheckCircleIcon, ClipboardIcon, UserIcon, CalendarIcon, ClockIcon, CheckIcon, XMarkIcon, ArrowDownTrayIcon   } from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import axios from "axios";
import Chart from "react-apexcharts";
import Vatar from "@/pages/dashboard/vatar";
import { FaFilter } from "react-icons/fa";
import { AiOutlinePlus } from "react-icons/ai";

export function Listclient() {
  const [clients, setClients] = useState([]); 
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedclient, setSelectedclient] = useState(null); 
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressColor, setProgressColor] = useState("bg-blue-500");
  const [successMessage, setSuccessMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedClient, setSelectedClient] = useState(null);
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [selectedDownloadClient, setSelectedDownloadClient] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState({
    TSKOBJ: false,
    NOMCLI: false,
    HURDEB: false,
    HURFIN: false,
    DATDEB: false,
  });
  const fieldMapping = {
    TSKOBJ: "Titre de la tâche",
    NOMCLI: "Nom du client",
    HURDEB: "Heure du début",
    HURFIN: "Heure de fin",
    DATDEB: "Date de la tâche",
  };

  const toggleFilterPopup = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFieldChange = (field) => {
    setSelectedFields((prevFields) => ({
      ...prevFields,
      [field]: !prevFields[field],
    }));
  };
  const [formData, setFormData] = useState({
    typeDeCreation: '',
    codeClient: '',
    date: '',
    groupePart: '',
    nomDeGroupe: '',
    autreCompte: '',
    nomDeClient: '',
    chargeDuCompte: '',
    nomEtRaison: '',
    activite: '',
    gerant: '',
    telephoneFixe: '',
    fax: '',
    email: '',
    siege: '',
    ville: '',
    formeJuridique: '',
    adresseLivraison: '',
    identifiantFiscal: '',
    nRC: '',
    nPatente: '',
    ice: '',
    banquePrincipale: '',
    agenceVille: '',
    numDeCompte: '',
    ripBancaire: '',
    typeDeContrat: '',
    zone: '',
    canal: '',
    customText: '',
  });
  const [contacts, setContacts] = useState([{ name: '', function: '', phone: '', email: '' }]);
  const [machines, setMachines] = useState([{ ref: '', qte: '', etat: '' }]);

  const [statistics, setStatistics] = useState({
    totalclients: 0,
    completedclients: 0,
    pendingclients: 0,
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const loggedInUSR = localStorage.getItem("loggedInUser");
  
        // If no user is logged in, you can handle it accordingly (e.g., redirect to login)
        if (!loggedInUSR) {
          console.error("User is not logged in");
          return;
        }
  
        const response = await axios.get("https://toptachesapi3.onrender.com/getallClientData/getallClientData", {
          headers: { usr: loggedInUSR },
        });
  
        if (response.data && response.data.length > 0) {
          const fetchedClients = response.data;
  
          // Calculate statistics
          const totalClients = fetchedClients.length;
          const completedClients = fetchedClients.filter(client => client.TSKSTA === "Réalisé").length;
          const pendingClients = fetchedClients.filter(client => client.TSKSTA === "À faire").length;
  
          setClients(fetchedClients);
          setStatistics({
            totalClients,
            completedClients,
            pendingClients,
          });
        } else {
          setClients([]); // Set empty array if no clients found
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
  
    fetchClients();
  }, []);

  const handleDownload = (clientId) => {
    const loggedInUSR = localStorage.getItem("loggedInUser");
  
    // Check if user is logged in
    if (!loggedInUSR) {
      console.error("User is not logged in");
      return;
    }
  
    // Fetch the client data
    axios.get(`https://toptachesapi3.onrender.com/getClientDataByID/getClientDataByID/${clientId}`, {
      headers: { usr: loggedInUSR },
    })
    .then((response) => {
      const client = response.data;
      setSelectedDownloadClient(client);  // Set the selected client for download
      setOpenDownloadDialog(true);  // Open the download confirmation dialog
    })
    .catch((error) => {
      console.error("Error fetching client data for download:", error);
    });
  };
  
  

  const downloadOrderPDF = async (client) => {
    setShowSuccess(false);
    setProgress(0);
    setSuccessMessage("");
    const contacts = [];
    client.contacts.forEach((contact) => {
      contacts.push({
        name: contact.Contact_Name,
        function: contact.Contact_Function,
        email: contact.Contact_Email,
        phone: contact.Contact_Phone,
      });
    });
    const contacts1 = [];
    client.machines.forEach((machine) => {
      contacts1.push({
        type: machine.Type_Machine,
        ref: machine.Reference,
        qte: machine.Quantite,
        etat: machine.Etat,
      });
    });
    const selectedOption1 = client.Est_Groupe === "1" ? "Oui" : "Non";
    const selectedOption2 = client.Client_Sous_Autre_Compte === "1" ? "Oui" : "Non";
    const clientInfo = {
      id: client.ID,
      companyName: client.Raison_Sociale,
      codeclient: client.Code_Client,
      datecreation: client.Date_Creation ? new Date(client.Date_Creation).toISOString().split('T')[0] : null,
      nomdegroupe: client.Nom_Groupe,
      nomdeclient: client.Nom_Client,
      chargeducompte: client.Charge_De_Compte,
      activity: client.Activite,
      manager: client.Gerant,
      phone: client.Telephone,
      fax: client.Fax,
      email: client.Email,
      headquarters: client.Siege,
      city: client.Ville,
      legalForm: client.Forme_Juridique,
      deliveryAddress: client.Adresse_Livraison,
      taxId: client.IFISCAL,
      rcNumber: client.RC,
      patentNumber: client.Patente,
      iceNumber: client.ICE,
      mainBank: client.Banque,
      bankBranch: client.Agence_Ville,
      accountNumber: client.Num_Compte,
      rip: client.Rip_Bancaire,
      zone: client.Zone,
      canal: client.Canal,
    };
    const typeCreation = client.Type_Creation;
    const isGroup = client.Est_Groupe;
    const otherAccount = client.Client_Sous_Autre_Compte;
    const contractType = client.Type_Contrat;
    try {
      const response = await fetch("https://toptachesapi3.onrender.com/downloadOrder/downloadOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientInfo,
          contacts,
          contacts1,
          selectedOption: client.Type_Creation,
          selectedOption1,
          selectedOption2,
          selectedOption4: client.Type_Contrat,
        }),
      });
    
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    
      // Process the PDF file
      const blob = await response.blob(); // Get the PDF as a blob
      const url = window.URL.createObjectURL(blob); // Create a URL for the blob
      const a = document.createElement("a"); // Create an anchor element
      a.href = url;
      a.download = `FICHE D’OUVERTURE COMPTE CLIENT - ${clientInfo.companyName}.pdf`; // Set the file name for download
      document.body.appendChild(a);
      a.click(); // Trigger the download
      document.body.removeChild(a); // Clean up the DOM
    
      // Show success message
      setShowSuccess(true);
      setSuccessMessage("Download successful!");
      setProgress(100);
    } catch (error) {
      console.error("Error during download:", error);
      setSuccessMessage("An error occurred");
    }
  };
  
  
  const handleOpenEditDialog = async (task) => {
        setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (client) => {
    if (client?.ID) {
      console.log("Opening delete dialog for client:", client); // Debug
      setSelectedClient(client);
      setOpenDeleteDialog(true);
    } else {
      console.error("Client data is invalid or missing an ID:", client);
    }
  };
  

  const handleDeleteClient = async (clientId) => {
    if (!clientId) {
      console.error("Client ID is undefined");
      return;
    }
  
    try {
      const response = await fetch(`https://toptachesapi3.onrender.com/deleteClientData/deleteClientData/${clientId}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        console.log("Client deleted successfully");
        // Perform any additional actions (e.g., refresh the list)
        setOpenDeleteDialog(false);
      } else {
        console.error("Failed to delete client");
      }
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const handleAddContact = () => {
    setContacts(prev => [...prev, { name: '', function: '', phone: '', email: '' }]);
  };
  const handleAddMachine = () => {
    setMachines(prev => [...prev, { ref: '', qte: '', etat: '' }]);
  };

  const filteredClients = clients.filter((client) => {
    return (
      client.Raison_Sociale.toLowerCase().includes(searchTerm.toLowerCase()) || 
      client.Email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const renderActionIcons = (client) => {
    return (
      <>
        <ArrowDownTrayIcon  
          className="h-4 w-4 cursor-pointer text-black"
          onClick={() => handleDownload(client.ID)}
        />
        <PencilIcon
          className="h-4 w-4 cursor-pointer text-blue-900"
        />
        <TrashIcon
          className="h-4 w-4 cursor-pointer text-red-800"
          onClick={() => handleOpenDeleteDialog(client)}
        />
      </>
    );
  };

  return (
    <div className="font-poppins mt-12">
      <div id="heading-tit">
        <h2>List comptes clients</h2>
      </div>
      <div className="mb-1 grid grid-cols-1 xl:grid-cols-1 bg-[#ECEFF100]">
        {/* Search and Filter Controls */}
        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="p-2 w-full outline-none focus:ring-0"
          />
        </div>
        <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-1 bg-[#ECEFF100]">
        <Card className="overflow-hidden xl:col-span-2 shadow-sm bg-[#ECEFF100]">
  <CardBody className="px-0 py-4 bg-[#ECEFF100]">
    {clients.map((client, index) => (
      <div
        key={index}
        className="flex flex-col justify-between px-6 py-4 bg-white shadow-lg rounded-lg mt-4 border-l-4 border-blue-900"
      >
        {/* Row for title */}
        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-[#183f7f]">
            {client.Raison_Sociale}
          </span>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-4 text-black-500">
              {renderActionIcons(client)}
            </div>
          </div>
        </div>

        <div className="">
          <span className="flex text-black text-[12px] gap-2 mt-1 mb-1">
            <UserIcon className="w-4 h-4 mr-2 text-[#183f7f]" />
            {client.Email}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex text-black text-[11px] gap-2 ">
            <CalendarIcon className="w-4 h-4 mr-2 text-[#183f7f]" />
            {new Date(client.Date_Creation).toLocaleDateString()}
          </span>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <h5 className="font-bold text-[#183f7f] text-sm">Machines:</h5>
          {client.machines && client.machines.length > 0 ? (
            client.machines.map((machine, idx) => (
              <div key={idx} className="text-xs text-black">
                <table className="w-full table-auto">
                  <thead>
                    <tr>
                      <th className="text-left font-semibold">Reference</th>
                      <th className="text-left font-semibold">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{machine.Reference}</td>
                      <td>{machine.Quantite}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <span>No machines found.</span>
          )}
        </div>

        {/* Row for contacts */}
        <div className="flex flex-col gap-2 mt-4">
          <h3 className="font-bold text-[#183f7f] text-sm">Contacts:</h3>
          {client.contacts && client.contacts.length > 0 ? (
            client.contacts.map((contact, idx) => (
              <div key={idx} className="text-xs text-black">
                <table className="w-full table-auto">
                  <thead>
                    <tr>
                      <th className="text-left font-semibold">Email</th>
                      <th className="text-left font-semibold">Téléphone</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{contact.Contact_Email}</td>
                      <td>{contact.Contact_Phone}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <span>No contacts found.</span>
          )}
        </div>
      </div>
    ))}
  </CardBody>
</Card>
<Dialog open={openDownloadDialog} onClose={() => setOpenDownloadDialog(false)}>
  <DialogHeader className="dialog-header">télécharger</DialogHeader>
  <DialogBody divider>
    <Typography className="dialog-body">
      Voulez-vous vraiment télécharger le fichier ?
    </Typography>
  </DialogBody>
  <DialogFooter className="dialog-footer">
    <Button
      onClick={() => {
        downloadOrderPDF(selectedDownloadClient); 
        setOpenDownloadDialog(false);
      }}
      className="btn-supprimer"
    >
      Télécharger
    </Button>
    <Button className="btn-annuler" onClick={() => setOpenDownloadDialog(false)}>
      Annuler
    </Button>
  </DialogFooter>
</Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
      <DialogHeader className="dialog-header">Confirmation de Suppression</DialogHeader>
      <DialogBody divider>
        <Typography className="dialog-body">
          Confirmez-vous la suppression de ce compte ?
        </Typography>
      </DialogBody>
      <DialogFooter className="dialog-footer">
        <Button
          onClick={() => handleDeleteClient(selectedClient?.ID)}
          className="btn-supprimer"
        >
          Supprimer
        </Button>
        <Button className="btn-annuler" onClick={() => setOpenDeleteDialog(false)}>
          Annuler
        </Button>
      </DialogFooter>
    </Dialog>

        </div>
      </div>
    </div>
  );
}

export default Listclient;
