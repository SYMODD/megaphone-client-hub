
import { supabase } from '@/integrations/supabase/client';
import { PDFTemplate } from '../types';
import { BucketManager } from '../bucketManager';

export class TemplateLoader {
  static async loadTemplates(): Promise<PDFTemplate[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Utilisateur non connecté, aucun template à charger');
        return [];
      }

      console.log('🔍 DEBUG: Chargement des templates pour l\'utilisateur:', user.id);

      // Récupérer le profil utilisateur pour debug
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      console.log('🔍 DEBUG: Rôle de l\'utilisateur actuel:', profile?.role);

      // Vérifier l'accès au bucket avant de continuer
      const bucketAccessible = await BucketManager.ensureBucket();
      if (!bucketAccessible) {
        console.error('❌ Le bucket pdf-templates n\'est pas accessible');
        throw new Error('Le bucket de stockage des templates n\'est pas disponible. Vérifiez la configuration Supabase.');
      }

      console.log('✅ Bucket accessible, synchronisation en cours...');

      // Synchroniser le bucket avec la base de données
      try {
        await BucketManager.syncBucketWithDatabase();
      } catch (syncError) {
        console.warn('Erreur lors de la synchronisation, mais continuons avec les données en base:', syncError);
      }

      // Récupérer tous les templates
      const { data: allTemplates, error: allError } = await supabase
        .from('pdf_templates')
        .select('*')
        .order('upload_date', { ascending: false });

      if (allError) {
        console.error('❌ Erreur lors de la récupération de tous les templates:', allError);
        throw new Error(`Impossible de charger les templates: ${allError.message}`);
      }

      console.log('🔍 DEBUG: Tous les templates récupérés:', allTemplates?.length);

      // Récupérer les profils des créateurs de templates
      const creatorIds = [...new Set(allTemplates?.map(t => t.user_id).filter(Boolean))];
      const { data: creatorProfiles } = await supabase
        .from('profiles')
        .select('id, role')
        .in('id', creatorIds);

      const creatorRoleMap = new Map(creatorProfiles?.map(p => [p.id, p.role]) || []);

      console.log('🔍 DEBUG: Détails des templates:', allTemplates?.map(t => ({
        id: t.id,
        name: t.name,
        user_id: t.user_id,
        creator_role: creatorRoleMap.get(t.user_id)
      })));

      // Filtrer manuellement selon notre logique
      const accessibleTemplates = allTemplates?.filter(template => {
        // L'utilisateur peut voir ses propres templates
        if (template.user_id === user.id) {
          console.log('✅ Template accessible (propriétaire):', template.name);
          return true;
        }

        // Si l'utilisateur est agent, il peut voir les templates des admins
        if (profile?.role === 'agent' && creatorRoleMap.get(template.user_id) === 'admin') {
          console.log('✅ Template accessible (agent -> admin):', template.name);
          return true;
        }

        console.log('❌ Template non accessible:', template.name, 'user_role:', profile?.role, 'creator_role:', creatorRoleMap.get(template.user_id));
        return false;
      }) || [];

      const templates = accessibleTemplates.map(template => ({
        id: template.id,
        name: template.name,
        fileName: template.file_name,
        uploadDate: template.upload_date,
        filePath: template.file_path
      }));

      console.log(`✅ ${templates.length} template(s) accessible(s) après filtrage manuel`);
      console.log('🔍 DEBUG: Templates finaux:', templates.map(t => t.name));
      
      return templates;
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
      // Retourner l'erreur avec un message plus explicite
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Erreur inconnue lors du chargement des templates');
      }
    }
  }
}
