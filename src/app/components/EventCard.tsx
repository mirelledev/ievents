"use client";
import axios from "axios";
import { useEventStore } from "@/store/useEventStore";
import { useState } from "react";
import DialogEdit from "./EditEventModal";
import Image from "next/image";
import trashbin from "../../assets/trashbin.svg";
import settings from "../../assets/settings.svg";

import { Loader2 } from "lucide-react";

export default function EventCard({
  event,
  token,
}: {
  // eslint-disable-next-line
  event: any;
  // eslint-disable-next-line
  token: any;
}) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const apiURL = process.env.API_BASE_URL;

  const [loading, setLoading] = useState<boolean>(false);

  const zapSvg = "https://www.svgrepo.com/show/452133/whatsapp.svg";

  const removeEvent = useEventStore((state) => state.removeEvent);

  const handleDelete = async (eventId: string) => {
    setLoading(true);

    const url = `${apiURL}/api/events/delevent`;

    try {
      const response = await axios.delete(url, {
        data: { id: eventId },
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoading(false);
      removeEvent(eventId);
      console.log("evento deletado com sucesso:", response.data);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <>
      <div className="w-full p-3 h-[270px] bg-neutral-800 border border-neutral-600 rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center mt-[80px]">
            <div>
              <Loader2 className="animate-spin" />
            </div>
          </div>
        ) : (
          <div>
            <h1 className="truncate font-bold">{event.title}</h1>

            <p className="text-neutral-300 mt-2 line-clamp-3">
              {event.description}
            </p>

            <div className="mt-2">
              <p className="font-bold">
                📅 {new Date(event.date).toLocaleDateString("pt-BR")}
              </p>
              <p className="font-bold">⏱ {event.time}</p>

              <p className="font-bold line-clamp-2">
                📍{" "}
                {event?.locate
                  .split(" ")
                  .slice(0, 4)
                  .join(" ")
                  .replace(/-$/, "")
                  .trim()}
              </p>
            </div>

            <div className="flex mt-2 flex-row items-center justify-center gap-4">
              <Image
                width={30}
                height={30}
                src={settings}
                alt="edit event"
                onClick={openModal}
                className="bg-neutral-500 p-2 rounded-full cursor-pointer size-10 hover:scale-105 transition-transform duration-200"
              />
              <Image
                width={38}
                height={30}
                alt="delete event"
                src={trashbin}
                onClick={() => handleDelete(event.id)}
                className="bg-red-500 cursor-pointer p-1 rounded-full size-10 hover:scale-105 transition-transform duration-200"
              />

              <Image
                width={100}
                height={100}
                alt="compartilhar no whatsapp"
                onClick={() => {
                  const message = `
      *Evento:* ${event.title}
_Descrição:_ ${event.description}
📅 *Data:* ${new Date(event.date).toLocaleDateString("pt-BR")}
⏱ *Horário:* ${event.time}
📍 *Localização:* ${event.locate}

📍 *Ver no Google Maps:* https://www.google.com/maps/search/${encodeURIComponent(
                    event.locate
                  )}


Para mais informações, entre em contato!`;
                  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(
                    message
                  )}`;
                  window.open(whatsappLink, "_blank");
                }}
                src={zapSvg}
                className="p-1 cursor-pointer bg-green-400 rounded-full size-10 hover:scale-105 transition-transform duration-200"
              />
            </div>
          </div>
        )}
      </div>
      {isModalOpen && (
        <DialogEdit isOpen={isModalOpen} onClose={closeModal} event={event} />
      )}
    </>
  );
}
