import Image from "next/image";

export default function Loading() {
  return (
    <div className="w-full h-full flex flex-col  justify-center items-center">
      <Image
        src={"/logo.svg"}
        alt="logo"
        width={320}
        height={120}
        className="animate-pulse duration-700"
      />
    </div>
  );
}
