"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import axios from "axios";
import EventCard from "../components/EventCard";
import AddEventModal from "../components/AddEventModal";
import { useEventStore } from "@/store/useEventStore";
import another from "../../assets/another.png";

export default function Portal() {
  const { events, setEvents } = useEventStore((state) => state);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const apiURL = process.env.API_BASE_URL;
  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
  };
  const [currentPage, setCurrentPage] = useState<number>(1);
  const eventsPerPage = 8;

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  const nextPage = () => {
    if (currentPage < Math.ceil(events.length / eventsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const { data: session, status } = useSession();
  const router = useRouter();
  const [user_first_name, setUser_first_name] = useState<string>("");

  const token = session?.user.token;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchEvents = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${apiURL}/api/events/getevents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(response.data.events);
    } catch (err) {
      console.log("Erro ao pegar eventos:", err);
    }
  };

  useEffect(() => {
    fetchEvents();

    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${apiURL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUser_first_name(response.data.user.firstName);
      })
      .catch((error) => console.log("Erro:", error));
    // eslint-disable-next-line
  }, [token]);

  if (status === "loading") {
    return <p>Carregando..</p>;
  }

  return (
    <>
      <div
        className="flex flex-col min-h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${another.src})` }}
      >
        <div className="flex">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-red-300  w-[70px] font-bold p-2 m-2 rounded-md border border-red-400 hover:text-white ml-auto"
          >
            sair
          </button>
        </div>

        <div className="flex flex-col text-center items-center justify-center">
          <div>
            <h1 className="text-white text-3xl font-bold mt-2">
              bem vindo ao <span className="text-purple-400">IEvents</span>,{" "}
              {user_first_name}
            </h1>
            <p className="text-neutral-300 text-xl">
              aqui, voce consegue criar editar e deletar seus eventos{" "}
              <span className="text-white bg-purple-500 p-1 rounded-md">
                na melhor forma!
              </span>
            </p>
          </div>

          <div className="mt-6 2xl:w-[1000px] xl:w-[1000px] lg:w-[900px] md:w-[700px] sm:w-[600px] w-[400px] bg-opacity-90 bg-neutral-900  border border-neutral-700 p-3 rounded-md">
            <div className="flex flex-row text-center p-2 justify-center">
              <h1 className="text-xl font-bold mb-3">seus eventos</h1>

              <button
                onClick={openModal}
                className="ml-auto mb-3 text-md text-white bg-purple-500 px-4 py-2 rounded-md hover:bg-purple-600  hover:scale-105 hover:font-bold transition-transform duration-200"
              >
                +
              </button>
              {isModalOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black opacity-50 z-10"
                    onClick={closeModal}
                  ></div>
                  <AddEventModal isOpen={isModalOpen} onClose={closeModal} />
                </>
              )}
            </div>

            <div className="grid 2xl:max-h-[600px] xl:max-h-[600px] 2xl:grid-cols-4 xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 text-center gap-4 p-2">
              {currentEvents?.length > 0 ? (
                currentEvents?.map((event, index) => (
                  <EventCard key={index} event={event} token={token} />
                ))
              ) : (
                <p>
                  voce ainda nao tem eventos, clique no botao <span>+</span>{" "}
                  para adicionar
                </p>
              )}
            </div>

            {events?.length >= 8 && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={prevPage}
                  className="px-4 py-2 text-white bg-purple-500 rounded-md cursor-pointer  font-bold"
                  disabled={currentPage === 1}
                >
                  ← Anterior
                </button>
                <span className="mx-4 mt-2 text-white">{`Página ${currentPage}`}</span>
                <button
                  onClick={nextPage}
                  className="px-4 py-2 text-white bg-purple-500 rounded-md cursor-pointer font-bold"
                  disabled={
                    currentPage >= Math.ceil(events.length / eventsPerPage)
                  }
                >
                  Próximo →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
