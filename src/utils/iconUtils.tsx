
import { 
  FileText, 
  Briefcase, 
  Home, 
  Car, 
  Star, 
  Shield, 
  Users, 
  Globe, 
  Heart,
  Building,
  Truck,
  Plane,
  Ship,
  Train,
  Camera,
  Music,
  Book,
  Palette,
  Coffee,
  ShoppingCart
} from "lucide-react";

const iconMap = {
  FileText,
  Briefcase,
  Home,
  Car,
  Star,
  Shield,
  Users,
  Globe,
  Heart,
  Building,
  Truck,
  Plane,
  Ship,
  Train,
  Camera,
  Music,
  Book,
  Palette,
  Coffee,
  ShoppingCart,
};

export const getIconComponent = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || FileText;
};
