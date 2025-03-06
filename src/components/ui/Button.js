export default function Button({ text, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 rounded-md transition-all duration-200 shadow-md ${
        disabled
          ? "submit-btn-theme cursor-not-allowed opacity-50"
          : "submit-btn-theme"
      }`}
    >
      {text}
    </button>
  );
}