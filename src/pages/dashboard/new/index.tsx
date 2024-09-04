import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/painelheader";
import { FiUpload } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { Input } from "../../../components/input"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().nonempty("O campo Nome é OBRIGATÓRIO"),
  model: z.string().nonempty("O Modelo é OBRIGATÓRIO"),
  year: z.string().nonempty("O Ano do veiculo é OBRIGATÓRIO"),
  km: z.string().nonempty("A kilometragem é OBRIGATÓRIO"),
  price: z.string().nonempty("O Preço é OBRIGATÓRIO"),
  city: z.string().nonempty("O Cidade é OBRIGATÓRIA"),
  whatsapp: z.string().min(1,"O Telefone é OBRIGATÓRIO").refine((value)=> /^(\d{10,11})$/.test(value), {
    message: "Numero de telefone inválido."
  })

})

export function New() {
  return (
    <Container>
      <DashboardHeader />

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
          <div className="absolute cursor-pointer">
            <FiUpload size={30} color="#000" />
          </div>
          <div className="cursor-pointer">
            <input type="file" accept="image/*" className="opacity-0 cursor-pointer"/>
          </div>
        </button>
      </div>

    <div className="h-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">

    </div>


    </Container>
  );
}
