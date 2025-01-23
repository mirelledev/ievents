"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { ChangeEvent, useState } from "react";
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSession } from "next-auth/react";
import { useEventStore } from "@/store/useEventStore";
import { useEffect } from "react";
import { pt } from "date-fns/locale";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line
  event: any;
};

export default function DialogEdit({ isOpen, onClose, event }: Props) {
  const { data: session } = useSession();
  const token = session?.user.token;
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<Date>();
  const apiURL = process.env.API_BASE_URL;
  const [error, setError] = useState<string>("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [CEP, setCEP] = useState<string>("");
  const [rua, setRua] = useState<string>("");
  const [numero, setNumero] = useState<string>("");

  const editEvent = useEventStore((state) => state.updateEvent);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setIsPopoverOpen(false);
  };

  const getLocalization = async (e: ChangeEvent<HTMLInputElement>) => {
    const inputCEP = e.target.value.replace(/\D/g, "");
    setCEP(inputCEP);

    if (inputCEP.length === 8) {
      try {
        const response = await axios.get(
          `https://viacep.com.br/ws/${inputCEP}/json/`
        );

        if (response.data.erro) {
          setError("CEP inválido. Por favor, verifique o CEP digitado.");
          setRua("");
          return;
        }

        setRua(response.data.logradouro || "");

        setError("");
      } catch (error) {
        console.error("Erro ao buscar endereço:", error);
        setError("Erro ao buscar endereço. Tente novamente.");
      }
    }
  };

  if (!isOpen) return null;

  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, "");

    if (value.length > 4) {
      value = value.slice(0, 4);
    }

    if (value.length >= 3) {
      value = value.slice(0, 2) + ":" + value.slice(2);
    }

    const [hours, minutes] = value.split(":").map(Number);

    if (hours > 23 || minutes > 59) {
      return;
    }

    setTime(value);
  };

  const isPastDate = (date: Date): boolean => {
    const now = new Date();
    const compareDate = new Date(date);

    now.setHours(0, 0, 0, 0);
    compareDate.setHours(0, 0, 0, 0);

    return compareDate < now;
  };

  // eslint-disable-next-line
  useEffect(() => {
    if (event) {
      setTime(event.time);
      setTitle(event.title);
      setDate(event.date ? new Date(event.date) : undefined);
      setDescription(event.description);
      const locate = event.locate;

      const ruaMatch = locate.match(/^[^\d\-]+/);
      const rua = ruaMatch ? ruaMatch[0].trim() : "";
      setRua(rua);

      const numeroMatch = locate.match(/\s(\d+)\s?-?/);
      const numero = numeroMatch ? numeroMatch[1] : "";
      setNumero(numero);

      const cepMatch = locate.match(/\d{8}$/);
      const cep = cepMatch ? cepMatch[0] : "";
      setCEP(cep);
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (title.length < 3) {
      setError("O título precisa ter pelo menos 3 caracteres");
      return;
    }

    if (title.length >= 30) {
      setError("O título só pode ser ate 30 caracteres");
      return;
    }

    if (numero.length >= 6) {
      setError("O numero do local so pode ter ate 5 caracteres");
      return;
    }
    if (description == "" || time == "" || rua == "" || CEP == "") {
      setError("Todos os campos devem ser preenchidos");
      return;
    }

    if (description.length > 60) {
      setError("A descricao só pode ser ate 60 caracteres");
      return;
    }

    if (date && isPastDate(date)) {
      setError("A data não pode ser anterior ao dia atual.");
      return;
    }

    const locate = rua + " " + numero + " " + "-" + " " + CEP;

    const updateFields = {
      id: event.id,
      title,
      description,
      time,
      date: date ? date.toISOString() : null,
      locate,
    };

    try {
      const response = await axios.put(
        `${apiURL}/api/events/edit`,

        updateFields,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const updatedFields = response.data.data;

        editEvent(event.id, updatedFields);

        onClose();
      }
    } catch (error) {
      console.log("Erro ao adicionar evento:", error);

      setError("Erro ao adicionar evento, tente novamente.");
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
      {" "}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
            <DialogDescription>
              Edite os detalhes do seu evento
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Título:
                </Label>
                <Input
                  id="title"
                  placeholder="ex.: Casa de praia"
                  className="col-span-3"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setTitle(e.target.value)
                  }
                  value={title}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descrição:
                </Label>
                <Input
                  id="description"
                  placeholder="ex.: Viagem para casa de praia [...]"
                  className="col-span-3"
                  value={description}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setDescription(e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="locate" className="text-right">
                  CEP:
                </Label>
                <Input
                  id="CEP "
                  placeholder="00000-000"
                  className="col-span-3"
                  value={CEP}
                  onChange={getLocalization}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="locate" className="text-right">
                  Rua:
                </Label>
                <Input
                  disabled
                  id="rua"
                  className="col-span-3"
                  value={rua}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setRua(e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="locate" className="text-right">
                  Numero:
                </Label>
                <Input
                  type="number"
                  id="numero"
                  placeholder="212"
                  className="col-span-3"
                  value={numero}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNumero(e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">
                  Horário:
                </Label>
                <Input
                  id="time"
                  placeholder="ex.: 12:00"
                  className="col-span-3"
                  value={time}
                  onChange={handleTimeChange}
                  maxLength={5}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Data:
                </Label>
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div
                      onTouchStart={() => setIsPopoverOpen(true)}
                      onClick={() => setIsPopoverOpen(true)}
                    >
                      <Button
                        type="button"
                        variant={"outline"}
                        className={cn(
                          "w-[255px] justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon />
                        {date ? (
                          format(date, "PPP")
                        ) : (
                          <span>Selecionar data</span>
                        )}
                      </Button>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      initialFocus={false}
                      locale={pt}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Editar Evento</Button>
              <Button onClick={onClose} variant="outline">
                Sair
              </Button>
            </DialogFooter>
            <p className="mt-3  p-3 rounded-sm text-red-300"> {error}</p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
