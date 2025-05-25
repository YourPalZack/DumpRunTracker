import { 
  User, InsertUser, DumpSite, InsertDumpSite, DumpRun, InsertDumpRun,
  DumpRunParticipant, InsertDumpRunParticipant, PickupRequest, InsertPickupRequest,
  ChatMessage, InsertChatMessage, Activity, InsertActivity, DumpRunWithDetails
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";
import type { SessionStore } from "express-session";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Session store
  sessionStore: SessionStore;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Dump site methods
  createDumpSite(site: InsertDumpSite): Promise<DumpSite>;
  getDumpSite(id: number): Promise<DumpSite | undefined>;
  getAllDumpSites(): Promise<DumpSite[]>;
  
  // Dump run methods
  createDumpRun(run: InsertDumpRun): Promise<DumpRun>;
  getDumpRun(id: number): Promise<DumpRun | undefined>;
  getAllDumpRuns(): Promise<DumpRun[]>;
  getDumpRunWithDetails(id: number): Promise<DumpRunWithDetails | undefined>;
  getUserDumpRuns(userId: number): Promise<DumpRun[]>;
  getUserJoinedRuns(userId: number): Promise<DumpRunWithDetails[]>;
  
  // Dump run participant methods
  joinDumpRun(participant: InsertDumpRunParticipant): Promise<DumpRunParticipant>;
  getDumpRunParticipants(dumpRunId: number): Promise<DumpRunParticipant[]>;
  getDumpRunParticipant(id: number): Promise<DumpRunParticipant | undefined>;
  updateDumpRunParticipant(id: number, updates: Partial<DumpRunParticipant>): Promise<DumpRunParticipant | undefined>;
  
  // Pickup request methods
  createPickupRequest(request: InsertPickupRequest): Promise<PickupRequest>;
  getPickupRequest(id: number): Promise<PickupRequest | undefined>;
  getPickupRequestsByUser(userId: number): Promise<PickupRequest[]>;
  
  // Chat message methods
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getDumpRunMessages(dumpRunId: number): Promise<ChatMessage[]>;
  
  // Activity methods
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivity(id: number): Promise<Activity | undefined>;
  getUserActivities(userId: number): Promise<Activity[]>;
  markActivityAsRead(id: number): Promise<Activity | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private dumpSites: Map<number, DumpSite>;
  private dumpRuns: Map<number, DumpRun>;
  private dumpRunParticipants: Map<number, DumpRunParticipant>;
  private pickupRequests: Map<number, PickupRequest>;
  private chatMessages: Map<number, ChatMessage>;
  private activities: Map<number, Activity>;
  
  sessionStore: SessionStore;
  
  private userIdCounter: number;
  private dumpSiteIdCounter: number;
  private dumpRunIdCounter: number;
  private participantIdCounter: number;
  private pickupRequestIdCounter: number;
  private chatMessageIdCounter: number;
  private activityIdCounter: number;

  constructor() {
    this.users = new Map();
    this.dumpSites = new Map();
    this.dumpRuns = new Map();
    this.dumpRunParticipants = new Map();
    this.pickupRequests = new Map();
    this.chatMessages = new Map();
    this.activities = new Map();
    
    this.userIdCounter = 1;
    this.dumpSiteIdCounter = 1;
    this.dumpRunIdCounter = 1;
    this.participantIdCounter = 1;
    this.pickupRequestIdCounter = 1;
    this.chatMessageIdCounter = 1;
    this.activityIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize sample dump sites
    this.seedDumpSites();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = {
      id,
      email: insertUser.email,
      username: insertUser.username,
      password: insertUser.password,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      phone: insertUser.phone ?? null,
      hasTruck: insertUser.hasTruck ?? null,
      profileImageUrl: insertUser.profileImageUrl ?? null,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  // Dump site methods
  async createDumpSite(site: InsertDumpSite): Promise<DumpSite> {
    const id = this.dumpSiteIdCounter++;
    const now = new Date();
    const dumpSite: DumpSite = {
      id,
      name: site.name,
      address: site.address,
      phone: site.phone ?? null,
      latitude: site.latitude ?? null,
      longitude: site.longitude ?? null,
      operatingHours: site.operatingHours ?? null,
      minFee: site.minFee ?? null,
      feePerTon: site.feePerTon ?? null,
      acceptsElectronics: site.acceptsElectronics ?? null,
      acceptsHazardousWaste: site.acceptsHazardousWaste ?? null,
      createdAt: now
    };
    this.dumpSites.set(id, dumpSite);
    return dumpSite;
  }
  
  async getDumpSite(id: number): Promise<DumpSite | undefined> {
    return this.dumpSites.get(id);
  }
  
  async getAllDumpSites(): Promise<DumpSite[]> {
    return Array.from(this.dumpSites.values());
  }
  
  // Dump run methods
  async createDumpRun(run: InsertDumpRun): Promise<DumpRun> {
    const id = this.dumpRunIdCounter++;
    const now = new Date();
    const dumpRun: DumpRun = {
      id,
      title: run.title,
      location: run.location,
      date: run.date,
      organizerId: run.organizerId,
      status: run.status ?? 'open',
      description: run.description ?? null,
      dumpSiteId: run.dumpSiteId ?? null,
      maxParticipants: run.maxParticipants ?? 5,
      createdAt: now
    };
    this.dumpRuns.set(id, dumpRun);
    return dumpRun;
  }
  
  async getDumpRun(id: number): Promise<DumpRun | undefined> {
    return this.dumpRuns.get(id);
  }
  
  async getAllDumpRuns(): Promise<DumpRun[]> {
    return Array.from(this.dumpRuns.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getDumpRunWithDetails(id: number): Promise<DumpRunWithDetails | undefined> {
    const dumpRun = this.dumpRuns.get(id);
    if (!dumpRun) return undefined;
    
    const organizer = this.users.get(dumpRun.organizerId);
    if (!organizer) return undefined;
    
    const participants = Array.from(this.dumpRunParticipants.values())
      .filter(p => p.dumpRunId === id)
      .map(p => {
        const user = this.users.get(p.userId);
        return { ...p, user: user! };
      });
    
    const dumpSite = dumpRun.dumpSiteId ? this.dumpSites.get(dumpRun.dumpSiteId) : undefined;
    
    const messages = Array.from(this.chatMessages.values())
      .filter(m => m.dumpRunId === id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    return {
      ...dumpRun,
      organizer,
      participants,
      dumpSite,
      messages
    };
  }
  
  async getUserDumpRuns(userId: number): Promise<DumpRun[]> {
    return Array.from(this.dumpRuns.values())
      .filter(run => run.organizerId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getUserJoinedRuns(userId: number): Promise<DumpRunWithDetails[]> {
    const participations = Array.from(this.dumpRunParticipants.values())
      .filter(p => p.userId === userId && p.status === "approved");
    
    const joinedRuns: DumpRunWithDetails[] = [];
    
    for (const participation of participations) {
      const runWithDetails = await this.getDumpRunWithDetails(participation.dumpRunId);
      if (runWithDetails) {
        joinedRuns.push(runWithDetails);
      }
    }
    
    return joinedRuns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  // Dump run participant methods
  async joinDumpRun(participant: InsertDumpRunParticipant): Promise<DumpRunParticipant> {
    const id = this.participantIdCounter++;
    const now = new Date();
    const dumpRunParticipant: DumpRunParticipant = { ...participant, id, createdAt: now };
    this.dumpRunParticipants.set(id, dumpRunParticipant);
    return dumpRunParticipant;
  }
  
  async getDumpRunParticipants(dumpRunId: number): Promise<DumpRunParticipant[]> {
    return Array.from(this.dumpRunParticipants.values())
      .filter(p => p.dumpRunId === dumpRunId);
  }
  
  async getDumpRunParticipant(id: number): Promise<DumpRunParticipant | undefined> {
    return this.dumpRunParticipants.get(id);
  }
  
  async updateDumpRunParticipant(id: number, updates: Partial<DumpRunParticipant>): Promise<DumpRunParticipant | undefined> {
    const participant = this.dumpRunParticipants.get(id);
    if (!participant) return undefined;
    
    const updatedParticipant = { ...participant, ...updates };
    this.dumpRunParticipants.set(id, updatedParticipant);
    return updatedParticipant;
  }
  
  // Pickup request methods
  async createPickupRequest(request: InsertPickupRequest): Promise<PickupRequest> {
    const id = this.pickupRequestIdCounter++;
    const now = new Date();
    const pickupRequest: PickupRequest = { ...request, id, createdAt: now };
    this.pickupRequests.set(id, pickupRequest);
    return pickupRequest;
  }
  
  async getPickupRequest(id: number): Promise<PickupRequest | undefined> {
    return this.pickupRequests.get(id);
  }
  
  async getPickupRequestsByUser(userId: number): Promise<PickupRequest[]> {
    return Array.from(this.pickupRequests.values())
      .filter(request => request.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  // Chat message methods
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.chatMessageIdCounter++;
    const now = new Date();
    const chatMessage: ChatMessage = { ...message, id, createdAt: now };
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }
  
  async getDumpRunMessages(dumpRunId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.dumpRunId === dumpRunId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  
  // Activity methods
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const now = new Date();
    const newActivity: Activity = { ...activity, id, createdAt: now, isRead: false };
    this.activities.set(id, newActivity);
    return newActivity;
  }
  
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async getUserActivities(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async markActivityAsRead(id: number): Promise<Activity | undefined> {
    const activity = this.activities.get(id);
    if (!activity) return undefined;
    
    const updatedActivity = { ...activity, isRead: true };
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }
  
  // Seed data
  private seedDumpSites() {
    const sites = [
      {
        name: "Cedar Hills Disposal Site",
        address: "16645 W Sunset Hwy, Seattle, WA 98106",
        latitude: 47.581707,
        longitude: -122.359238,
        phone: "(555) 123-4567",
        operatingHours: "Mon-Fri: 8:00 AM - 5:00 PM, Sat-Sun: 9:00 AM - 4:00 PM",
        minFee: 25,
        feePerTon: 120,
        acceptsElectronics: true,
        acceptsHazardousWaste: false
      },
      {
        name: "Riverside Waste Management",
        address: "8761 River Road, Portland, OR 97203",
        latitude: 45.590208,
        longitude: -122.721381,
        phone: "(555) 987-6543",
        operatingHours: "Mon-Sat: 7:00 AM - 6:30 PM, Sun: 8:00 AM - 4:30 PM",
        minFee: 20,
        feePerTon: 95,
        acceptsElectronics: true,
        acceptsHazardousWaste: true
      },
      {
        name: "Greenfield Disposal Center",
        address: "6234 Meadow Lane, Vancouver, WA 98665",
        latitude: 45.638729,
        longitude: -122.661096,
        phone: "(555) 456-7890",
        operatingHours: "Mon-Fri: 7:30 AM - 5:30 PM, Sat: 8:00 AM - 4:00 PM",
        minFee: 22,
        feePerTon: 105,
        acceptsElectronics: true,
        acceptsHazardousWaste: false
      }
    ];
    
    sites.forEach(site => {
      const id = this.dumpSiteIdCounter++;
      const now = new Date();
      const dumpSite: DumpSite = { 
        ...site, 
        id, 
        createdAt: now
      };
      this.dumpSites.set(id, dumpSite);
    });
  }
}

export const storage = new MemStorage();
