const fs=require('fs'); const ts=require('typescript');
const commit='52c514258a5c2fd433df4c9eddf91fce8f14cca7';
const data=[];
function unit(id,file,line,level,title,description,source,opts={}) {const sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS); const nodes=[];function walk(n,parent,depth){const k=ts.SyntaxKind[n.kind];const start=n.getStart(sf);const end=n.end;const idx=nodes.length;nodes.push({k,start,end,parent,depth,text:source.slice(start,end)});ts.forEachChild(n,c=>walk(c,idx,depth+1));}ts.forEachChild(sf,n=>walk(n,-1,0));data.push({id,file,line,level,title,description,source,nodes,diagnostics:sf.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')),...opts});}
unit('state','src/components/ApplicationsDashboard.tsx',21,'Atome','Les trois états UI','Trois liaisons locales, trois setters. Les données métier ne résident pas ici.',`    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);`);
unit('find','src/components/ApplicationsDashboard.tsx',27,'Expression','Recherche de la candidature','find parcourt le snapshot ; ?? transforme une absence en null. Aucun setter, aucune sauvegarde.',`    const selectedCandidature = candidatures.find(candidature => candidature.id === selectedId) ?? null;
    const editingCandidature = candidatures.find(candidature => candidature.id === editingId) ?? null;`);
unit('callback','src/components/ApplicationTable.tsx',97,'Interaction','Du clic au callback','La fonction fléchée attend le clic. Elle capture candidature et transmet son id.',`onClick={() => onRowClick(candidature.id)}`,{context:'Attribut JSX analysé dans un fragment enveloppé',wrap:true});
unit('props','src/components/ApplicationsDashboard.tsx',105,'Composant','Transmission de props','Le parent transmet le tableau et la fonction setSelectedId elle-même, sans appeler cette fonction.',`                <ApplicationTable
                    candidatures={candidatures}
                    onRowClick={setSelectedId} />`);
unit('drawer','src/components/ApplicationsDashboard.tsx',96,'Composant','Rendu du détail','Quand la donnée dérivée existe, React peut rendre le tiroir. Fermer remet seulement selectedId à null.',`selectedCandidature && (
                <DetailDrawer
                    candidature={selectedCandidature}
                    onClose={() => setSelectedId(null)}
                    onDelete={deleteCandidature}
                    onEdit={editCandidature}
                />
            )`,{note:'Expression JSX extraite ; accolades de conteneur omises. La première ligne est partielle.'});
unit('add','src/components/ApplicationsDashboard.tsx',24,'Fonction','Ajouter sans muter','Le paramètre newCandidature représente un objet métier. Le spread crée un nouveau tableau et saveCandidatures le persiste.',`    const addCandidature = (newCandidature: Candidature) => {
        saveCandidatures([...candidatures, newCandidature]);
    };`);
unit('update','src/components/ApplicationsDashboard.tsx',29,'Fonction','Remplacer avec map','Chaque élément est examiné. Le bon ID entraîne un remplacement ; les autres objets gardent leur référence.',`    const updateCandidature = (updatedCandidature: Candidature) => {
        const updatedCandidatures = candidatures.map(candidature =>
            candidature.id === updatedCandidature.id ? updatedCandidature : candidature
        );
        saveCandidatures(updatedCandidatures);
    };`);
unit('close','src/components/ApplicationsDashboard.tsx',36,'Fonction','Fermer le formulaire','Deux demandes de mise à jour ; aucune transformation de la collection.',`    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
    };`);
unit('edit','src/components/ApplicationsDashboard.tsx',42,'Interaction','Passer en édition','Garde si ID absent, puis trois setters. Le formulaire reçoit la candidature dérivée au rendu suivant.',`    const editCandidature = (id: string) => {
        // Logique pour éditer la candidature en filtrant l'ID de la candidature à partir de la liste des candidatures
        const candidatureToEdit = candidatures.find(candidature => candidature.id === id);
        if (!candidatureToEdit) {
            console.error("Candidature non trouvée pour l'ID :", id);
            return;
        }
        setEditingId(id);
        setSelectedId(null);
        setShowForm(true);

    };`);
unit('delete','src/components/ApplicationsDashboard.tsx',54,'Fonction','Supprimer avec filter','La condition conserve les éléments d’un autre ID. La sélection est effacée seulement si elle cible l’objet supprimé.',`    const deleteCandidature = (id: string) => {
        const remainingCandidatures = candidatures.filter(
            (candidature) => candidature.id !== id
        );
        saveCandidatures(remainingCandidatures);
        if (selectedId === id) {
            setSelectedId(null);
        }
    };`);
unit('sync','src/components/ApplicationsDashboard.tsx',16,'Système','Connecter le store externe','Les trois fonctions relient abonnement, snapshot client et snapshot serveur à React.',`    const candidatures = useSyncExternalStore(
        subscribeCandidatures,
        getCandidaturesSnapshot,
        getServerCandidaturesSnapshot
    );`);
unit('formInit','src/components/ApplicationForm.tsx',39,'Fonction','Initialisation du formulaire','Convertit un objet métier éventuel en état plat de saisie. Les valeurs absentes reçoivent des défauts.',`export function createInitialFormState(candidatureToEdit?: Candidature): FormState {
    return {
        entreprise: candidatureToEdit?.entreprise ?? "",
        posteVise: candidatureToEdit?.posteVise ?? "",
        contrat: candidatureToEdit?.contrat ?? "cdi",
        statut: candidatureToEdit?.statut ?? "a_preparer",
        priorite: candidatureToEdit?.priorite ?? "moyenne",
        dateCreation: candidatureToEdit?.dateCreation ?? new Date().toISOString().split("T")[0], // Format YYYY-MM-DD
        dateEnvoi: candidatureToEdit?.dateEnvoi ?? "",
        dateRelance: candidatureToEdit?.dateRelance ?? "",
        contact: candidatureToEdit?.contact ?? "",
        notes: candidatureToEdit?.notes ?? "",
        mode: candidatureToEdit?.mode ?? "annonce", // Mode initial par défaut
        sourceAnnonce: candidatureToEdit?.mode === "annonce" ? candidatureToEdit.sourceAnnonce : "linkedin",
        urlAnnonce: candidatureToEdit?.mode === "annonce" ? (candidatureToEdit.urlAnnonce ?? "") : "",
        referenceAnnonce: candidatureToEdit?.mode === "annonce" ? (candidatureToEdit.referenceAnnonce ?? "") : "",
        canalApproche: candidatureToEdit?.mode === "spontanee" ? (candidatureToEdit.canalApproche ?? "email") : "email",
        raisonCiblage: candidatureToEdit?.mode === "spontanee" ? (candidatureToEdit.raisonCiblage ?? "") : "",
    };
}`);
unit('change','src/components/ApplicationForm.tsx',65,'Fonction','Un gestionnaire universel','Déstructure name et value ; copie l’état précédent puis remplace la propriété désignée par name.',`    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };`);
unit('mode','src/components/ApplicationForm.tsx',76,'Fonction','Changer de branche','Le setter fonctionnel reçoit l’état précédent et construit un nouvel objet, sans effacer les autres champs.',`    const handleModeChange = (nouveauMode: "annonce" | "spontanee") => {
        setFormData((prev) => ({ ...prev, mode: nouveauMode }));
    };`);
unit('submit','src/components/ApplicationForm.tsx',81,'Interaction','Composer une candidature','Empêche la soumission native, construit la base, aiguillage selon mode, puis transmet l’objet au parent. as ISODate ne valide pas la date.',`    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // On extrait et prépare la base commune
        const baseCandidature = {
            id: candidatureToEdit?.id ?? crypto.randomUUID(),
            entreprise: formData.entreprise,
            posteVise: formData.posteVise,
            contrat: formData.contrat,
            statut: formData.statut,
            priorite: formData.priorite,
            dateCreation: formData.dateCreation as ISODate, // On force le type de manière sûre ici
            ...(formData.dateEnvoi && { dateEnvoi: formData.dateEnvoi as ISODate }),
            ...(formData.dateRelance && { dateRelance: formData.dateRelance as ISODate }),
            ...(formData.contact && { contact: formData.contact }),
            ...(formData.notes && { notes: formData.notes }),
        };

        let donneesFinales: Candidature;

        // On aiguille dynamiquement selon le scénario choisi par l'utilisateur
        if (formData.mode === "annonce") {
            donneesFinales = {
                ...baseCandidature,
                mode: "annonce",
                sourceAnnonce: formData.sourceAnnonce,
                ...(formData.urlAnnonce && { urlAnnonce: formData.urlAnnonce }),
                ...(formData.referenceAnnonce && { referenceAnnonce: formData.referenceAnnonce }),
            };
        } else {
            donneesFinales = {
                ...baseCandidature,
                mode: "spontanee",
                canalApproche: formData.canalApproche,
                ...(formData.raisonCiblage && { raisonCiblage: formData.raisonCiblage }),
            };
        }
        onSubmit(donneesFinales);
    };`);
unit('confirm','src/components/DetailDrawer.tsx',24,'Fonction','Confirmer la suppression','window.confirm est un effet navigateur. Le callback est appelé seulement après une confirmation.',`    const handleDeleteClick = () => {
        const isConfirmed = window.confirm(
            \`Supprimer la candidature pour \${candidature.entreprise} ? Cette action est irréversible.\`
        );
        if (isConfirmed) {
            onDelete(candidature.id);
        }
    }`);
unit('table','src/components/ApplicationTable.tsx',99,'Composant','Fabriquer les cellules','Les colonnes configurent leur propre render ; chaque candidature fournit les données pour une ligne.',`{columns.map((column) => (
    <td key={column.key} className={cellClassName}>
        {column.render(candidature)}
    </td>
))}`,{note:'Extrait de JSX remis en forme pour la lecture.',wrap:true});
unit('date','src/lib/date.ts',1,'Fonction','Convertir une date','Une entrée optionnelle ; chaîne de secours ou représentation localisée. Le fuseau par défaut est celui du runtime.',`export function formatDate(date?: string): string {
    if (!date) {
        return "—";
    }
    return new Date(date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}`,{full:true,sha:'8292f179774f8e744f2c2e45f791811fff381ea9'});
unit('statusBadge','src/components/StatusBadge.tsx',1,'Composant','Badge de statut','La clé statut sélectionne une configuration. Les classes et le libellé proviennent du référentiel.',`import { STATUT_CANDIDATURE, StatutCandidature } from "@/lib/status";



interface StatusBadgeProps {
    statut: StatutCandidature;
}

export function StatusBadge({ statut }: StatusBadgeProps) {
    const config = STATUT_CANDIDATURE[statut];

    return (
        <span className={\`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset \${config.badgeClassName}\`}>
            {config.label}
        </span>
    );
}

`,{full:true,sha:'fd7e716b28cc75e73bcb0a17957ae13321e31f70'});
unit('priorityBadge','src/components/PriorityBadges.tsx',1,'Composant','Badge de priorité','Même principe que StatusBadge. Le référentiel contient également description et order, non utilisés ici.',`import {
    PRIORITE_CANDIDATURE,
    type PrioriteCandidature,
} from "@/lib/priority";

interface PriorityBadgesProps {
    priorite: PrioriteCandidature;
}

export function PriorityBadges({ priorite }: PriorityBadgesProps) {
    const config = PRIORITE_CANDIDATURE[priorite];

    return (
        <span className={\`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset \${config.badgeClassName}\`}>
            {config.label}
        </span>
    );
}`,{full:true,sha:'7a872c8508b9ca22d6731fa42f38ceec14b1ab20'});
unit('priorityOrder','src/lib/priority.ts',35,'Expression','Ordre des priorités','satisfies vérifie les éléments, pas l’exhaustivité ni les doublons ; order ne déclenche aucun tri automatiquement.',`export const PRIORITE_CANDIDATURE_ORDER = [
    "haute",
    "moyenne",
    "basse",
] as const satisfies readonly PrioriteCandidature[];`);
unit('statusType','src/lib/status.ts',1,'Atome','Contrat de configuration','Chaque entrée doit posséder des champs de présentation et un ordre numérique.',`type StatutConfig = {
    label: string;
    description: string;
    badgeClassName: string;
    dotClassName: string;
    order: number;
};`);
unit('types','src/lib/types.ts',1,'Système','Contrat de données','Les interfaces structurent les données ; l’union est discriminée par mode. Les types n’existent pas au runtime.',`import type { StatutCandidature } from "@/lib/status";
import type { PrioriteCandidature } from "@/lib/priority";

export type ISODate = \`\${number}-\${number}-\${number}\`;

export const CONTRAT_CANDIDATURE = {
    alternance: "Alternance",
    cdd: "CDD",
    cdi: "CDI",
    stage: "Stage",
    freelance: "Freelance",
} as const;

export type ContratCandidature = keyof typeof CONTRAT_CANDIDATURE;

export const SOURCE_ANNONCE = {
    linkedin: "LinkedIn",
    indeed: "Indeed",
    welcome_to_the_jungle: "Welcome to the Jungle",
    france_travail: "France Travail",
    site_entreprise: "Site entreprise",
    autre: "Autre",
} as const;

export type SourceAnnonce = keyof typeof SOURCE_ANNONCE;


export const CANAL_APPROCHE = {
    email: "Email",
    linkedin: "LinkedIn",
    site_entreprise: "Site entreprise",
    reseau: "Réseau",
    autre: "Autre",
} as const;

export type CanalApproche = keyof typeof CANAL_APPROCHE;


export interface BaseCandidature {
    id: string;
    entreprise: string;
    posteVise: string;
    contrat: ContratCandidature;
    statut: StatutCandidature;
    dateCreation: ISODate;
    dateEnvoi?: ISODate;
    dateRelance?: ISODate;
    dateReponse?: ISODate;
    contact?: string;
    notes?: string;
    priorite: PrioriteCandidature;
}

export interface CandidatureSpontanee extends BaseCandidature {
    mode: "spontanee";
    raisonCiblage?: string;
    canalApproche?: CanalApproche;
}

export interface CandidatureAnnonce extends BaseCandidature {
    mode: "annonce";
    sourceAnnonce: SourceAnnonce;
    urlAnnonce?: string;
    referenceAnnonce?: string;
}

// On exporte le type Candidature qui peut être soit une candidature spontanée, soit une candidature à une annonce.
export type Candidature =
    | CandidatureSpontanee
    | CandidatureAnnonce;`,{full:true,sha:'89db0a368a2a9fe18c38f20ae2c75246ebe6a81b'});
unit('guard','src/lib/storage.ts',8,'Fonction','Contrôle à la frontière','Garde de type partiel : mode et champs principaux sont vérifiés, mais sourceAnnonce ne l’est pas. in accepte des clés héritées.',`function isCandidature(value: unknown): value is Candidature {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return false;
    }
    const candidature = value as Record<string, unknown>;
    return (
        typeof candidature.id === "string" &&
        typeof candidature.entreprise === "string" &&
        typeof candidature.posteVise === "string" &&
        typeof candidature.contrat === "string" &&
        candidature.contrat in CONTRAT_CANDIDATURE &&
        typeof candidature.statut === "string" &&
        candidature.statut in STATUT_CANDIDATURE &&
        typeof candidature.dateCreation === "string" &&
        typeof candidature.priorite === "string" &&
        candidature.priorite in PRIORITE_CANDIDATURE &&
        (candidature.mode === "spontanee" || candidature.mode === "annonce")
    );
}`);
unit('snapshot','src/lib/storage.ts',66,'Système','Snapshot stable','Lecture paresseuse après invalidation ; le cache conserve sa référence jusqu’au prochain changement.',`export function getCandidaturesSnapshot(): Candidature[] {
    if (!hasHydrated) {
        cache = readFromLocalStorage();
        hasHydrated = true;
    }
    return cache;
}`);
unit('subscribe','src/lib/storage.ts',83,'Système','Abonner et désabonner','Le callback est enregistré, un événement storage externe invalide le cache. La fonction retournée nettoie les deux abonnements.',`export function subscribeCandidatures(callback: () => void): () => void {
    listeners.add(callback);

    const handleStorageEvent = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY) return;
        hasHydrated = false; // force une relecture au prochain getSnapshot
        callback();
    };
    window.addEventListener("storage", handleStorageEvent);

    return () => {
        listeners.delete(callback);
        window.removeEventListener("storage", handleStorageEvent);
    };
}`);
unit('save','src/lib/storage.ts',104,'Système','Persister et notifier','Le cache est remplacé avant la sauvegarde. En cas d’erreur, les abonnés sont quand même notifiés.',`export function saveCandidatures(next: Candidature[]): void {
    cache = next;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
        console.error("Impossible de sauvegarder les candidatures :", error);
    }
    listeners.forEach((listener) => listener());
}`);
unit('page','src/app/page.tsx',1,'Composant','Point d’entrée','Le composant page compose le cadre de l’application et monte ApplicationsDashboard.',`import ApplicationsDashboard from "@/components/ApplicationsDashboard";

export default function App() {
    return (
        <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-950">
            <section className="mx-auto max-w-7xl space-y-8">
                <header className="flex flex-col gap-2">
                    <h1 className="text-sm font-medium text-blue-600">
                        Suivi candidatures
                    </h1>
                    <p className="max-w-2xl text-sm text-slate-500">
                        Une première version statique pour suivre les candidatures, les
                        statuts, les priorités et les prochaines actions.
                    </p>
                </header>
                <ApplicationsDashboard />
            </section>
        </main>
    );
}`,{full:true,sha:'ff00ff77c7652ad5ee971d6bcbfa142a1d4d733d'});
// Wrap isolated JSX snippets solely for parsing; offsets restored to original text.
for(const u of data.filter(u=>u.wrap)) {const pre=u.id==='callback'?'<div ':'<>';const post=u.id==='callback'?' />':'</>';const sf=ts.createSourceFile('fragment.tsx',pre+u.source+post,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const nodes=[];function walk(n,parent,depth){const start=n.getStart(sf)-pre.length,end=n.end-pre.length;let p=parent,d=depth;if(start>=0&&end<=u.source.length){p=nodes.length;nodes.push({k:ts.SyntaxKind[n.kind],start,end,parent,depth,text:u.source.slice(start,end)});d++;}ts.forEachChild(n,c=>walk(c,p,d));}ts.forEachChild(sf,n=>walk(n,-1,0));u.nodes=nodes;u.diagnostics=sf.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' '));}
const crypto=require('crypto');for(const u of data.filter(u=>u.full)){const match=[u.source,u.source+'\n',u.source+'\n\n',u.source.replace(/\n+$/,'')].find(s=>crypto.createHash('sha1').update('blob '+Buffer.byteLength(s)+'\0').update(s).digest('hex')===u.sha);u.verified=!!match; if(!match)console.warn('SHA mismatch',u.file);}
const catalog={commit,tsVersion:ts.version,units:data};fs.writeFileSync(process.argv[2]||'catalog.json',JSON.stringify(catalog));console.log('units',data.length,'nodes',data.reduce((n,u)=>n+u.nodes.length,0),'diagnostics',data.filter(u=>u.diagnostics.length).map(u=>[u.id,u.diagnostics]));
