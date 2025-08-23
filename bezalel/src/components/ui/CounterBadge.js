import { Card, Badge, Typography } from "@mui/material";
export default function CounterBadge({
  count,
  icon,
  index,
  stateHandler,
  state,
}) {
  return (
    <Card
      onClick={() => stateHandler(index)}
      key={index}
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor:
          state === index
            ? "rgba(80, 80, 80, 0.9)" // darker or highlighted background
            : "rgba(40, 40, 40, 0.7)",
        borderRadius: 3,
        p: 2,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid rgba(255,255,255,0.1)",
        "&:hover": {
          transform: "translateY(-8px) scale(1.02)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        },
      }}
    >
      <Badge
        sx={{
          color: "whitesmoke",
          "& .MuiBadge-badge": {
            fontSize: "0.8rem", // size of badge text
          },
        }}
        badgeContent={<Typography sx={{ ml: 2 }}>{count}</Typography>}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {icon}
      </Badge>
    </Card>
  );
}
