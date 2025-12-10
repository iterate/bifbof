export interface Task {
  id: string;
  title: string;
  description: string;
  dependencies: string[];
  status: string;
}

export interface Config {
  columns: string[];
}
