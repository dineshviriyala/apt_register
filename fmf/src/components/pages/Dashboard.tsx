import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import TenantDashboard from "@/components/dashboard/TenantDashboard";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
interface User {
  phone: string;
  role: string;
  name: string;
  flatNumber?: string;
  apartmentCode?: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user"); // or localStorage if you're using that
    if (!storedUser) {
      toast({
        title: "Access denied",
        description: "Please log in to access the dashboard",
        variant: "destructive",
      });
      navigate("/login-form");
      return;
    }

    const parsed = JSON.parse(storedUser);
    const { phone } = parsed;

    const validateUser = async () => {
      try {
        const res = await axios.post(
          "http://localhost:5001/api/auth/validate",
          {
            phoneNumber: phone,
          }
        );
        setUser(res.data);
      } catch (err: any) {
        console.error("Validation failed:", err);
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive",
        });
        sessionStorage.removeItem("user");
        navigate("/login-form");
      } finally {
        setIsLoading(false);
      }
    };

    validateUser();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user.role === "admin" ? (
        <AdminDashboard user={user} />
      ) : (
        <TenantDashboard user={user} />
      )}
    </div>
  );
};

export default Dashboard;
