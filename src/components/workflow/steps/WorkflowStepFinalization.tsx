import React from "react";
import { WorkflowStepProps } from "@/types/workflowTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Save, User, Phone, CreditCard, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { uploadClientPhoto } from "@/utils/storageUtils";

export const WorkflowStepFinalization: React.FC<WorkflowStepProps> = ({
  step,
  isActive,
  isCompleted,
  onComplete,
  onError,
  documentType,
  workflowData,
  onDataUpdate
}) => {
  const { extractedData, scannedImage, barcode, phone, barcodeImageUrl } = workflowData;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFinalize = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour sauvegarder");
      return;
    }

    if (!extractedData) {
      toast.error("Aucune donnée à sauvegarder");
      return;
    }

    setIsLoading(true);
    console.log("🎯 WORKFLOW FINALIZATION - Début sauvegarde directe en base");

    try {
      // 1. Upload de l'image si présente
      let photoUrl = null;
      if (scannedImage) {
        console.log("📤 Upload image vers client-photos");
        const folderName = documentType === 'cin' ? 'cin' : 
                          documentType === 'passeport_marocain' ? 'passeport-marocain' : 
                          documentType === 'passeport_etranger' ? 'passeport-etranger' : 'carte-sejour';
        
        photoUrl = await uploadClientPhoto(scannedImage, folderName);
        if (!photoUrl) {
          console.warn("⚠️ Erreur upload image, continue sans photo");
        }
      }

      // 2. Récupération du profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("❌ Erreur récupération profil:", profileError);
        throw new Error("Impossible de récupérer le profil utilisateur");
      }

      // 3. Détermination de la catégorie
      const getCategorie = (pointOperation: string | undefined): string => {
        if (!pointOperation) return 'agence';
        if (pointOperation.startsWith('aeroport')) return 'aeroport';
        if (pointOperation.startsWith('navire')) return 'navire';
        return 'agence';
      };

      const pointOperation = profile?.point_operation || 'agence_centrale';
      const categorie = getCategorie(pointOperation);

      // 4. Préparation des données client
      const clientData = {
        nom: extractedData.nom?.trim() || '',
        prenom: extractedData.prenom?.trim() || '',
        nationalite: extractedData.nationalite || (documentType === 'cin' ? 'Maroc' : ''),
        numero_passeport: extractedData.numero_cin || extractedData.numero_passeport || extractedData.numero_carte || '',
        numero_telephone: phone || extractedData.numero_telephone || '',
        code_barre: barcode || '',
        code_barre_image_url: barcodeImageUrl || '',
        photo_url: photoUrl || '',
        observations: '',
        date_enregistrement: new Date().toISOString().split('T')[0],
        document_type: documentType,
        agent_id: user.id,
        point_operation: pointOperation,
        categorie: categorie
      };

      // 5. Validation des champs obligatoires
      if (!clientData.nom || !clientData.prenom || !clientData.numero_passeport) {
        toast.error("Données incomplètes. Nom, prénom et numéro de document requis.");
        return;
      }

      console.log("💾 WORKFLOW - Insertion client:", clientData);

      // 6. Insertion en base de données
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select();

      if (error) {
        console.error('❌ Erreur insertion:', error);
        if (error.code === '23505') {
          toast.error("Ce numéro de document existe déjà dans la base de données");
        } else {
          toast.error(`Erreur lors de l'enregistrement: ${error.message}`);
        }
        return;
      }

      console.log("✅ WORKFLOW - Client sauvegardé:", data[0]);
      toast.success(`Client ${clientData.prenom} ${clientData.nom} enregistré avec succès!`);
      
      // 7. Redirection vers la base clients
      navigate("/base-clients");

    } catch (error) {
      console.error('❌ Erreur sauvegarde workflow:', error);
      toast.error("Erreur lors de la sauvegarde");
      onError("Erreur de sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentTypeDisplay = () => {
    switch (documentType) {
      case 'cin':
        return 'Carte d\'Identité Nationale';
      case 'passeport_marocain':
        return 'Passeport Marocain';
      case 'passeport_etranger':
        return 'Passeport Étranger';
      case 'carte_sejour':
        return 'Carte de Séjour';
      default:
        return 'Document';
    }
  };

  const getCompletionStats = () => {
    let completedSteps = 0;
    let totalSteps = 4;
    
    if (scannedImage) completedSteps++;
    if (extractedData) completedSteps++;
    if (barcode || workflowData.steps.find(s => s.id === 'barcode')?.status === 'completed') completedSteps++;
    completedSteps++; // Finalisation en cours
    
    return { completedSteps, totalSteps };
  };

  const stats = getCompletionStats();

  return (
    <div className="space-y-6">
      {/* Récapitulatif */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Récapitulatif du traitement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Type de document :</span>
              <Badge variant="outline">{getDocumentTypeDisplay()}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progression :</span>
              <Badge className="bg-green-600">
                {stats.completedSteps}/{stats.totalSteps} étapes
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Données extraites */}
      {extractedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {extractedData.nom && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Nom :</span>
                  <span className="text-sm">{extractedData.nom}</span>
                </div>
              )}
              
              {extractedData.prenom && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Prénom :</span>
                  <span className="text-sm">{extractedData.prenom}</span>
                </div>
              )}
              
              {extractedData.date_naissance && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Date de naissance :</span>
                  <span className="text-sm">{extractedData.date_naissance}</span>
                </div>
              )}
              
              {extractedData.nationalite && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Nationalité :</span>
                  <span className="text-sm">{extractedData.nationalite}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informations de contact */}
      {(barcode || phone) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Informations de contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {barcode && (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Code-barres :</span>
                  <span className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">
                    {barcode}
                  </span>
                </div>
              )}
              
              {phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Téléphone :</span>
                  <span className="text-sm">{phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      {(scannedImage || barcodeImageUrl) && (
        <Card>
          <CardHeader>
            <CardTitle>Images capturées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scannedImage && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Document principal</h4>
                  <img 
                    src={scannedImage} 
                    alt="Document scanné" 
                    className="w-full h-32 object-cover rounded border"
                  />
                </div>
              )}
              
              {barcodeImageUrl && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Code-barres</h4>
                  <img 
                    src={barcodeImageUrl} 
                    alt="Code-barres scanné" 
                    className="w-full h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action de finalisation */}
      <div className="text-center">
        <Button 
          onClick={handleFinalize}
          size="lg"
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 min-w-[200px]"
        >
          <Save className="w-5 h-5 mr-2" />
          {isLoading ? "Sauvegarde..." : "Enregistrer le client"}
        </Button>
        <p className="text-sm text-gray-600 mt-2">
          {isLoading ? "Enregistrement en cours..." : "Cliquez pour sauvegarder définitivement le client"}
        </p>
      </div>
    </div>
  );
}; 