
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const availableIcons = [
  { name: "FileText", icon: FileText, label: "Document" },
  { name: "Briefcase", icon: Briefcase, label: "Porte-documents" },
  { name: "Home", icon: Home, label: "Maison" },
  { name: "Car", icon: Car, label: "Voiture" },
  { name: "Star", icon: Star, label: "Étoile" },
  { name: "Shield", icon: Shield, label: "Bouclier" },
  { name: "Users", icon: Users, label: "Utilisateurs" },
  { name: "Globe", icon: Globe, label: "Globe" },
  { name: "Heart", icon: Heart, label: "Cœur" },
  { name: "Building", icon: Building, label: "Bâtiment" },
  { name: "Truck", icon: Truck, label: "Camion" },
  { name: "Plane", icon: Plane, label: "Avion" },
  { name: "Ship", icon: Ship, label: "Bateau" },
  { name: "Train", icon: Train, label: "Train" },
  { name: "Camera", icon: Camera, label: "Caméra" },
  { name: "Music", icon: Music, label: "Musique" },
  { name: "Book", icon: Book, label: "Livre" },
  { name: "Palette", icon: Palette, label: "Palette" },
  { name: "Coffee", icon: Coffee, label: "Café" },
  { name: "ShoppingCart", icon: ShoppingCart, label: "Panier" },
];

interface IconSelectorProps {
  selectedIcon: string;
  onIconSelect: (iconName: string) => void;
}

export const IconSelector = ({ selectedIcon, onIconSelect }: IconSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedIconData = availableIcons.find(icon => icon.name === selectedIcon);
  const SelectedIconComponent = selectedIconData?.icon || FileText;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Icône</label>
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-start"
        >
          <SelectedIconComponent className="w-4 h-4 mr-2" />
          {selectedIconData?.label || "Sélectionner une icône"}
        </Button>
        
        {isOpen && (
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Choisir une icône</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {availableIcons.map((iconData) => {
                  const IconComponent = iconData.icon;
                  return (
                    <Button
                      key={iconData.name}
                      type="button"
                      variant={selectedIcon === iconData.name ? "default" : "outline"}
                      size="sm"
                      className="h-12 flex flex-col items-center justify-center p-2"
                      onClick={() => {
                        onIconSelect(iconData.name);
                        setIsOpen(false);
                      }}
                      title={iconData.label}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-xs mt-1 truncate w-full">{iconData.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
