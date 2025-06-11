
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, TestTube } from "lucide-react";
import { RecaptchaConfigForm } from "./RecaptchaConfigForm";
import { RecaptchaStatusTester } from "./RecaptchaStatusTester";

export const RecaptchaTabs: React.FC = () => {
  return (
    <Tabs defaultValue="config" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="config" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Configuration
        </TabsTrigger>
        <TabsTrigger value="testing" className="flex items-center gap-2">
          <TestTube className="w-4 h-4" />
          Tests & Statut
        </TabsTrigger>
      </TabsList>

      <TabsContent value="config">
        <RecaptchaConfigForm />
      </TabsContent>

      <TabsContent value="testing">
        <RecaptchaStatusTester />
      </TabsContent>
    </Tabs>
  );
};
