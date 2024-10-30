import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/painelheader";
import { FiUpload, FiTrash } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { Input } from "../../../components/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { v4 as uuidV4 } from "uuid";
import { storage, db } from "../../../services/firebaseConnection";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().nonempty("O campo Nome é OBRIGATÓRIO"),
  model: z.string().nonempty("O Modelo é OBRIGATÓRIO"),
  year: z.string().nonempty("O Ano do veiculo é OBRIGATÓRIO"),
  km: z.string().nonempty("A kilometragem é OBRIGATÓRIO"),
  price: z.string().nonempty("O Preço é OBRIGATÓRIO"),
  city: z.string().nonempty("O Cidade é OBRIGATÓRIA"),
  whatsapp: z
    .string()
    .min(1, "O Telefone é OBRIGATÓRIO")
    .refine((value) => /^(\d{11,12})$/.test(value), {
      message: "Numero de telefone inválido.",
    }),
  description: z.string().nonempty("A descrição é OBRIGATÓRIA"),
});

type FormData = z.infer<typeof schema>;

interface ImageItemProps {
  uid: string;
  name: string;
  previewUrl: string;
  url: string;
}

export function New() {
  const { user } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const [carImages, setCarImages] = useState<ImageItemProps[]>([]);

  function onSubmit(data: FormData) {
    if (carImages.length === 0) {
      toast.error("Envie ao menos 1 imagem!");

      return;
    }

    const carListImages = carImages.map((car) => {
      return {
        uid: car.uid,
        name: car.name,
        url: car.url,
      };
    });

    addDoc(collection(db, "cars"), {
      name: data.name.toUpperCase(),
      model: data.model,
      whatsapp: data.whatsapp,
      city: data.city,
      year: data.year,
      km: data.km,
      price: data.price,
      description: data.description,
      created: new Date(),
      owner: user?.name,
      uid: user?.uid,
      images: carListImages,
    })
      .then(() => {
        reset();
        setCarImages([]);
        console.log("Cadastrado com SUCESSO");
        toast.success("Carro cadastrado com sucesso!");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Falha ao cadastrar carro.");
        console.log("error ao cadastrar", error);
      });
  }

  async function handleDeleteImage(item: ImageItemProps) {
    const imagePath = `images/${item.uid}/${item.name}`;
    const imageRef = ref(storage, imagePath);

    try {
      await deleteObject(imageRef);
      setCarImages(carImages.filter((car) => car.url !== item.url));
    } catch (error) {
      console.log("Erro ao deletar", error);
    }
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const image = e.target.files[0];

      if (image.type === "image/jpeg" || image.type === "image/png") {
        const previewUrl = URL.createObjectURL(image); // Gera o preview
        await handleUpload(image, previewUrl); // Passa o preview para handleUpload
      } else {
        alert("Envie uma imagem .jpeg ou .png!");
        return;
      }
    }
  }

  async function handleUpload(image: File, previewUrl: string) {
    if (!user?.uid) {
      return;
    }

    const currentUid = user?.uid;
    const uidImage = uuidV4();
    const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`);

    uploadBytes(uploadRef, image).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadUrl) => {
        const imageItem = {
          name: uidImage,
          uid: currentUid,
          previewUrl, // Adiciona o previewUrl direto aqui
          url: downloadUrl,
        };

        setCarImages((images) => [...images, imageItem]);
        toast.success("Imagem enviada com sucesso!");

        console.log("Imagem adicionada:", imageItem); // Log para debug
      });
    });
  }

  return (
    <Container>
      <DashboardHeader />

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
          <div className="absolute cursor-pointer">
            <FiUpload size={30} color="#000" />
          </div>
          <div className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="opacity-0 cursor-pointer"
              onChange={handleFile}
            />
          </div>
        </button>

        {carImages.map((item) => (
          <div
            className="w-full h-32 flex items-center justify-center relative"
            key={item.name}
          >
            <button
              className="absolute p-2 bg-red-500 rounded-full"
              onClick={() => handleDeleteImage(item)}
            >
              <FiTrash size={28} color="#FFF" />
            </button>
            <img
              src={item.previewUrl}
              className="roudend-lg w-full h-32 object-cover"
              alt="foto do carro'"
            />
          </div>
        ))}
      </div>

      <div className="h-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <p className="mb-2 font-medium ">Nome do carro</p>
            <Input
              type="text"
              register={register}
              name="name"
              error={errors.name?.message}
              placeholder="Ex: Fiat Mobi 1.0..."
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium ">Modelo do carro</p>
            <Input
              type="text"
              register={register}
              name="model"
              error={errors.model?.message}
              placeholder="Ex: 2.0 Flex AUTOMATICO..."
            />
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium ">Ano do carro</p>
              <Input
                type="text"
                register={register}
                name="year"
                error={errors.year?.message}
                placeholder="Ex: 2021/2021..."
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium ">KM rodados</p>
              <Input
                type="text"
                register={register}
                name="km"
                error={errors.km?.message}
                placeholder="Ex: 43.900..."
              />
            </div>
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium ">Telefone</p>
              <Input
                type="text"
                register={register}
                name="whatsapp"
                error={errors.whatsapp?.message}
                placeholder="Ex: (091) 93843-2123..."
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium ">Cidade</p>
              <Input
                type="text"
                register={register}
                name="city"
                error={errors.city?.message}
                placeholder="Ex: Sorocaba - SP..."
              />
            </div>
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium ">Preço: </p>
            <Input
              type="text"
              register={register}
              name="price"
              error={errors.price?.message}
              placeholder="Ex: 43.940..."
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium ">Descrição </p>
            <textarea
              className="border-2 w-full rounded-md h-24 px-2"
              {...register("description")}
              name="description"
              id="description"
              placeholder="Digite a descrição completa sobre o carro..."
            />
            {errors.description && (
              <p className="mb-1 text-red-500">{errors.description.message} </p>
            )}
          </div>

          <div className="flex items-end justify-center p-4">
            <button
              type="submit"
              className="rounded-md bg-zinc-900 text-white flex items-center justify-center  font-medium w-60 h-10"
            >
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </Container>
  );
}
