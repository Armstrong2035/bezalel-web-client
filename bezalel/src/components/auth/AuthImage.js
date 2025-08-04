import { Stack } from "@mui/material";
import Image from "next/image";
export default function AuthImage({ src }) {
  return (
    <Stack>
      <Image
        src={src}
        alt="Bezalel Logo"
        width={300}
        height={300}
        style={{
          width: "100%",
          height: "auto",
          maxWidth: "300px",
          display: "block",
          margin: "0 auto",
        }}
      />
    </Stack>
  );
}
