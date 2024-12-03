import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Alert,
  Card,
  CardHeader,
  CardBody,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
} from "@material-tailwind/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { EyeIcon, PencilIcon, TrashIcon,CheckCircleIcon, ClipboardIcon ,UserIcon, CalendarIcon, ClockIcon,CheckIcon, XMarkIcon} from "@heroicons/react/24/outline";

export function Notifications() {
  const [tasks, setTasks] = useState([]);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [removingTaskId, setRemovingTaskId] = useState(null);

  useEffect(() => {
    const fetchTasksForTomorrow = async () => {
      try {
        const response = await axios.get('https://toptachesapi3.onrender.com/notifications/test-tasks-tomorrow', {
          headers: { usr: localStorage.getItem('loggedInUser') }
        });
        if (response.data.success) {
          setTasks(response.data.data);
        } else {
          console.error('No tasks found for tomorrow');
        }
      } catch (error) {
        console.error('Failed to fetch tasks for tomorrow:', error);
      }
    };

    fetchTasksForTomorrow();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return '';
    }
  };
  
  const formatTime = (timeString) => {
    if (!timeString) {
      console.log("formatTime called with undefined or null");
      return '';
    }
  
    try {
      const timeParts = timeString.split(':'); // Assuming time is in "HH:mm:ss" or "HH:mm" format
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
  
      const date = new Date();
      date.setUTCHours(hours, minutes, 0); // Set time in UTC (GMT)
  
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // 24-hour format
        timeZone: 'GMT' // Force GMT timezone
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return ''; 
    }
  };

  const handleOpenViewDialog = async (task) => {
    try {
      const response = await axios.get(`https://toptachesapi3.onrender.com/tasks/taskbynum/${task.TSKNUM}`, {
        headers: { usr: localStorage.getItem("loggedInUser") },
      });
      console.log("API Response:", response.data); // Log the API response
      if (response.data && response.data.success) {
        setSelectedTask(response.data.data); // Set the task details from the response
        setOpenViewDialog(true);
      } else {
        console.error("Task not found or error fetching task details");
      }
    } catch (error) {
      console.error("Error fetching task details:", error);
    }
  };

  const handleRemoveNotification = (task) => {
    // Start removing animation by setting task id
    setRemovingTaskId(task.TSKNUM);

    // Delay removing the task from the list to allow the animation to finish
    setTimeout(() => {
      setTasks((prevTasks) => prevTasks.filter((t) => t.TSKNUM !== task.TSKNUM));
      setRemovingTaskId(null); // Reset removingTaskId
    }, 500); // Delay in ms (this should match the duration of your CSS animation)
  };

  const renderActionIcons = (task) => {
    return (
      <>
        <EyeIcon
          className="h-4 w-4 cursor-pointer text-black"
          onClick={() => {
            console.log("Opening dialog for task:", task);
            handleOpenViewDialog(task);
          }}
        />
        <TrashIcon
          className="h-4 w-4 cursor-pointer text-red-800"
          onClick={() => handleRemoveNotification(task)} 
        />
      </>
    );
  };

  return (
    <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
      <div id="heading-tit"><h2>Notification</h2></div>
      <Card className="overflow-hidden xl:col-span-2 shadow-sm bg-[#ECEFF100]">
        <CardHeader color="transparent" floated={false} shadow={false} className="m-0 p-4">
          <Typography variant="h5" color="blue-gray">
            Les tâches du demain à traiter
          </Typography>
        </CardHeader>
        <CardBody className="px-0 py-4 bg-[#ECEFF100]">
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <div
                key={index}
                className={`flex flex-col justify-between px-6 py-4 bg-white shadow-lg rounded-lg mt-4 border-l-4 border-blue-900 transition-all duration-500 ${
                  removingTaskId === task.TSKNUM ? 'opacity-0 translate-x-10' : ''
                }`}
              >
                {/* Row for task title */}
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-[#183f7f]">
                    {task.TSKOBJ} 
                  </span>
                  <div className="flex flex-col items-end gap-2">
                    {/* Actions */}
                    <div className="flex gap-4 text-black-500">
                      {renderActionIcons(task)}
                    </div>
                    {/* Button "Réalisé/À Faire" */}
                
                  </div>
                </div>

                {/* Row for client name */}
                <div className="flex text-black text-[12px] gap-2 mt-1 mb-1">
                  <UserIcon className="w-4 h-4 mr-2 text-[#183f7f]" />
                  {task.NOMCLI} 
                </div>

                {/* Row for scheduled date */}
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 mr-2 text-[#183f7f]" />
                  <span className="text-black text-[11px]">
                    {formatDate(task.DATDEB)} 
                  </span>
                </div>

                {/* Row for time range */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#183f7f] text-[11px]">
                    <ClockIcon className="w-4 h-4 mr-2 text-[#183f7f]" />
                    <span>
                      De {formatTime(task.HURDEB)} à {formatTime(task.HURFIN)}
                    </span>
                  </div>

                  {/* Status Button */}
                  <button
                    className={`text-white text-[12px] px-4 py-1 rounded-2xl ${
                      task.TSKSTA === 'Réalisé' ? 'bg-[#007f66]' : 'bg-[#183f7f]'
                    }`}
                  >
                    {task.TSKSTA === 'Réalisé' ? 'Réalisé' : 'À Faire'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center py-4">
              <Typography>Aucune tâche prévue pour demain.</Typography>
            </div>
          )}
        </CardBody>
      </Card>
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        animate={{
          mount: { scale: 1, opacity: 1 },
          unmount: { scale: 0.9, opacity: 0 },
        }}
      >
        <DialogHeader className="dialog-header">Détail de la tâche</DialogHeader>
        <DialogBody
          divider
          style={{
            overflowY: "auto",
            maxHeight: "300px",
            padding: "10px",
          }}
        >
          {selectedTask ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Type de Tâche", value: selectedTask.TSKTYP },
                { label: "Action de la Tâche", value: selectedTask.TSKACT },
                { label: "Date de Début", value: formatDate(selectedTask.DATDEB) },
                { label: "Heure de Début", value: formatTime(selectedTask.HURDEB) },
                { label: "Heure de Fin", value: formatTime(selectedTask.HURFIN) },
                { label: "Code Client", value: selectedTask.CLI },
                { label: "Nom de Client", value: selectedTask.NOMCLI },
                { label: "Catégorie", value: selectedTask.CATCLI },
                { label: "Adresse de Client", value: selectedTask.ADRCLI },
                { label: "Nom de Contact", value: selectedTask.NOMCNT },
                { label: "Fonction de Client", value: selectedTask.FNCCNT },
                { label: "Téléphone", value: selectedTask.TELCNT },
                { label: "Objet de la Tâche", value: selectedTask.TSKOBJ },
                { label: "Compte Rendu", value: selectedTask.TSKCMR },
                { label: "Statut", value: selectedTask.TSKSTA },
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column", // Make it column to align values to the left
                    padding: "8px",
                    borderRadius: "8px",
                    gap: "5px", // Add spacing between label and value
                  }}
                >
                  <Typography
                    variant="small"
                    style={{
                      fontFamily: "Poppins, sans-serif", // Change font to Poppins
                      color: "#183f7f", // Set color to #183f7f
                      fontWeight: "bold",
                      fontSize: "12px", // Smaller font size for labels
                    }}
                  >
                    {item.label}:
                  </Typography>
                  <span
                    style={{
                      fontFamily: "Poppins, sans-serif", // Change font to Poppins
                      fontSize: "14px", // Smaller font size for values
                      textAlign: "left", // Align text to the left
                      maxWidth: "100%",
                      overflowWrap: "break-word",
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Typography>No task selected</Typography>
          )}
        </DialogBody>
        <DialogFooter className="dialog-footer">
          <Button className="btn-supprimer" onClick={() => setOpenViewDialog(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </Dialog>
    </div>

  );
}

export default Notifications;
