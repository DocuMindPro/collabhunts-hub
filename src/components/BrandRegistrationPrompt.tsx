import { useNavigate } from "react-router-dom";
import { Building2, CheckCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BrandRegistrationPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BrandRegistrationPrompt = ({ open, onOpenChange }: BrandRegistrationPromptProps) => {
  const navigate = useNavigate();

  const handleRegister = () => {
    onOpenChange(false);
    navigate("/brand-signup");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="text-center sm:text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-xl">Register Your Brand</AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-4">
            <p>
              To browse and connect with creators, you need to register your brand first.
            </p>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Free registration</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Takes less than 2 minutes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Direct access to all creators</span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRegister} className="bg-primary hover:bg-primary/90">
            Register Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BrandRegistrationPrompt;
