"use client";
import axios from "axios";
import { useEventStore } from "@/store/useEventStore";
import { useState } from "react";
import DialogEdit from "./EditEventModal";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";

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
  const [progressValue, setProgressValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const zapSvg = "https://www.svgrepo.com/show/452133/whatsapp.svg";

  const removeEvent = useEventStore((state) => state.removeEvent);

  const handleDelete = async (eventId: string) => {
    setLoading(true);
    setProgressValue(0);
    const url = `${apiURL}/api/events/delevent`;
    setProgressValue(25);

    try {
      setProgressValue(50);
      const response = await axios.delete(url, {
        data: { id: eventId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgressValue(100);
      setLoading(false);
      removeEvent(eventId);
      console.log("evento deletado com sucesso:", response.data);
    } catch (error) {
      setProgressValue(100);
      setLoading(false);
      console.error(error);
    }

    setProgressValue(100);
    setLoading(false);
  };

  return (
    <>
      <div className="w-full p-3 h-[270px] bg-neutral-800 border border-neutral-600 rounded-lg">
        {loading ? (
          <Progress value={progressValue} />
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
              <button
                onClick={openModal}
                className="bg-neutral-500 p-1 rounded-full size-10 hover:scale-105 transition-transform duration-200"
              >
                ⚙
              </button>
              <button
                onClick={() => handleDelete(event.id)}
                className="bg-red-500 p-1 rounded-full size-10 hover:scale-105 transition-transform duration-200"
              >
                🗑
              </button>

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
