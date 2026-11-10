import logoSmartPos from "@/assets/images/logo-smart-pos.png"
type FormLogoProps = {
  className?: string;
};

export default function FormLogo({
  className = "self-center-safe mb-8 w-[50%]",
}: FormLogoProps) {
  return (
    <img
      src={logoSmartPos}
      alt="Smart POS Logo"
      className={className}
    />
  );
}
