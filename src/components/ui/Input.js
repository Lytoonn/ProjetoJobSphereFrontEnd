import { forwardRef } from "react";

// ✅ Componente reutilizável para campos de entrada
const Input = forwardRef(({ label, type = "text", name, value, onChange, disabled }, ref) => {
  return (
    <div className="mb-4 w-full">
      <label className="block text-sm font-medium login-txt-form">{label}</label>
      <input
        ref={ref}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full mt-1 p-3 border rounded-md input-form-theme focus:ring focus:ring-blue-400 focus:outline-none ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
});

export default Input;