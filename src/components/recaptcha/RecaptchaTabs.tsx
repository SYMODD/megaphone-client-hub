
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecaptchaConfigForm } from "./RecaptchaConfigForm";
import { RecaptchaStatusTester } from "./RecaptchaStatusTester";
import { RecaptchaValidationTester } from "./RecaptchaValidationTester";

export const RecaptchaTabs = () => {
  return (
    <Tabs defaultValue="config" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="config">Configuration</TabsTrigger>
        <TabsTrigger value="testing">Tests de Statut</TabsTrigger>
        <TabsTrigger value="validation">Validation</TabsTrigger>
      </TabsList>
      
      <TabsContent value="config" className="space-y-4">
        <RecaptchaConfigForm />
      </TabsContent>
      
      <TabsContent value="testing" className="space-y-4">
        <RecaptchaStatusTester />
      </TabsContent>
      
      <TabsContent value="validation" className="space-y-4">
        <RecaptchaValidationTester />
      </TabsContent>
    </Tabs>
  );
};
