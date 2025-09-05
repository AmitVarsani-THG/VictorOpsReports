import { type ApiConfig, type Team, type User, type Incident, type ReportSummary } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // API Configuration
  setApiConfig(config: ApiConfig): Promise<void>;
  getApiConfig(): Promise<ApiConfig | undefined>;
  
  // Cached data from VictorOps
  setTeams(teams: Team[]): Promise<void>;
  getTeams(): Promise<Team[]>;
  setUsers(users: User[]): Promise<void>;
  getUsers(): Promise<User[]>;
  
  // Report cache
  setReportCache(key: string, data: ReportSummary): Promise<void>;
  getReportCache(key: string): Promise<ReportSummary | undefined>;
}

export class MemStorage implements IStorage {
  private apiConfig: ApiConfig | undefined;
  private teams: Team[] = [];
  private users: User[] = [];
  private reportCache: Map<string, ReportSummary> = new Map();

  constructor() {}

  async setApiConfig(config: ApiConfig): Promise<void> {
    this.apiConfig = config;
  }

  async getApiConfig(): Promise<ApiConfig | undefined> {
    return this.apiConfig;
  }

  async setTeams(teams: Team[]): Promise<void> {
    this.teams = teams;
  }

  async getTeams(): Promise<Team[]> {
    return this.teams;
  }

  async setUsers(users: User[]): Promise<void> {
    this.users = users;
  }

  async getUsers(): Promise<User[]> {
    return this.users;
  }

  async setReportCache(key: string, data: ReportSummary): Promise<void> {
    this.reportCache.set(key, data);
  }

  async getReportCache(key: string): Promise<ReportSummary | undefined> {
    return this.reportCache.get(key);
  }
}

export const storage = new MemStorage();
