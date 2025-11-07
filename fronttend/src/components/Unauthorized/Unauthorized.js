import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold mb-4 text-red-600">
        Access Denied
      </h1>
      <p className="text-gray-600 mb-6">
        You do not have permission to view this page.
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
      >
        Go Back
      </button>
    </div>
  );
}
