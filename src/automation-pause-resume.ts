import * as fs from 'fs';
import * as path from 'path';

export interface AutomationTask {
  id: string;
  name: string;
  function: () => Promise<any>;
  status: 'pending' | 'running' | 'completed' | 'paused' | 'failed';
  result?: any;
  error?: string;
  startTime?: string;
  endTime?: string;
}

export interface AutomationState {
  isPaused: boolean;
  currentTaskIndex: number;
  tasks: AutomationTask[];
  pauseReason?: string;
  pauseTimestamp?: string;
  resumeTimestamp?: string;
  totalTasks: number;
  completedTasks: number;
}

export class AutomationPauseResumeSystem {
  private stateFile = './automation-state.json';
  private tasks: AutomationTask[] = [];
  private currentState: AutomationState;
  private isRunning = false;

  constructor() {
    this.currentState = {
      isPaused: false,
      currentTaskIndex: 0,
      tasks: [],
      totalTasks: 0,
      completedTasks: 0
    };
  }

  /**
   * Add automation task
   */
  addTask(name: string, taskFunction: () => Promise<any>): string {
    const task: AutomationTask = {
      id: this.generateTaskId(),
      name,
      function: taskFunction,
      status: 'pending'
    };

    this.tasks.push(task);
    this.currentState.tasks = this.tasks;
    this.currentState.totalTasks = this.tasks.length;

    console.log(`📝 Added task: ${name} (${task.id})`);
    return task.id;
  }

  /**
   * Start automation execution
   */
  async startExecution(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Automation đã đang chạy');
      return;
    }

    this.isRunning = true;
    this.currentState.isPaused = false;
    this.currentState.currentTaskIndex = 0;
    this.currentState.completedTasks = 0;

    console.log('🚀 Bắt đầu automation với', this.tasks.length, 'tasks');
    await this.saveState();

    await this.executeTasks();
  }

  /**
   * Execute all tasks
   */
  private async executeTasks(): Promise<void> {
    for (let i = 0; i < this.tasks.length; i++) {
      if (!this.isRunning) {
        console.log('⏹️ Automation đã dừng');
        break;
      }

      // Check if paused
      if (this.currentState.isPaused) {
        console.log('⏸️ Automation đã pause, chờ resume...');
        await this.waitForResume();
      }

      const task = this.tasks[i];
      this.currentState.currentTaskIndex = i;

      try {
        console.log(`🔄 Executing task ${i + 1}/${this.tasks.length}: ${task.name}`);
        
        task.status = 'running';
        task.startTime = new Date().toISOString();
        await this.saveState();

        // Execute task
        const result = await task.function();
        
        task.status = 'completed';
        task.result = result;
        task.endTime = new Date().toISOString();
        this.currentState.completedTasks++;

        console.log(`✅ Task completed: ${task.name}`);

      } catch (error) {
        task.status = 'failed';
        task.error = error instanceof Error ? error.message : String(error);
        task.endTime = new Date().toISOString();

        console.error(`❌ Task failed: ${task.name}`, error);
        
        // Decide whether to continue or stop
        if (this.shouldStopOnError(task)) {
          console.log('🛑 Stopping automation due to critical error');
          break;
        }
      }

      await this.saveState();
    }

    this.isRunning = false;
    console.log('🏁 Automation completed');
  }

  /**
   * Pause automation
   */
  async pause(reason: string = 'Manual pause'): Promise<void> {
    this.currentState.isPaused = true;
    this.currentState.pauseReason = reason;
    this.currentState.pauseTimestamp = new Date().toISOString();

    // Mark current task as paused
    if (this.currentState.currentTaskIndex < this.tasks.length) {
      const currentTask = this.tasks[this.currentState.currentTaskIndex];
      if (currentTask.status === 'running') {
        currentTask.status = 'paused';
      }
    }

    await this.saveState();
    console.log(`⏸️ Automation paused: ${reason}`);
  }

  /**
   * Resume automation
   */
  async resume(): Promise<void> {
    this.currentState.isPaused = false;
    this.currentState.resumeTimestamp = new Date().toISOString();
    this.currentState.pauseReason = undefined;

    await this.saveState();
    console.log('▶️ Automation resumed');
  }

  /**
   * Stop automation completely
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    this.currentState.isPaused = false;
    
    // Mark current task as failed if running
    if (this.currentState.currentTaskIndex < this.tasks.length) {
      const currentTask = this.tasks[this.currentState.currentTaskIndex];
      if (currentTask.status === 'running' || currentTask.status === 'paused') {
        currentTask.status = 'failed';
        currentTask.error = 'Automation stopped manually';
        currentTask.endTime = new Date().toISOString();
      }
    }

    await this.saveState();
    console.log('⏹️ Automation stopped');
  }

  /**
   * Wait for resume
   */
  private async waitForResume(): Promise<void> {
    while (this.currentState.isPaused && this.isRunning) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  /**
   * Get current automation status
   */
  getStatus(): AutomationState {
    return { ...this.currentState };
  }

  /**
   * Get progress percentage
   */
  getProgress(): number {
    if (this.currentState.totalTasks === 0) return 0;
    return Math.round((this.currentState.completedTasks / this.currentState.totalTasks) * 100);
  }

  /**
   * Check if automation is running
   */
  isAutomationRunning(): boolean {
    return this.isRunning && !this.currentState.isPaused;
  }

  /**
   * Check if automation is paused
   */
  isAutomationPaused(): boolean {
    return this.currentState.isPaused;
  }

  /**
   * Load state from file
   */
  async loadState(): Promise<void> {
    try {
      if (fs.existsSync(this.stateFile)) {
        const data = fs.readFileSync(this.stateFile, 'utf8');
        this.currentState = JSON.parse(data);
        console.log('📂 Loaded automation state from file');
      }
    } catch (error) {
      console.error('❌ Error loading automation state:', error);
    }
  }

  /**
   * Save state to file
   */
  private async saveState(): Promise<void> {
    try {
      fs.writeFileSync(this.stateFile, JSON.stringify(this.currentState, null, 2));
    } catch (error) {
      console.error('❌ Error saving automation state:', error);
    }
  }

  /**
   * Clear all tasks and reset state
   */
  async clearTasks(): Promise<void> {
    this.tasks = [];
    this.currentState = {
      isPaused: false,
      currentTaskIndex: 0,
      tasks: [],
      totalTasks: 0,
      completedTasks: 0
    };
    await this.saveState();
    console.log('🗑️ Cleared all tasks and reset state');
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Decide whether to stop on error
   */
  private shouldStopOnError(task: AutomationTask): boolean {
    // Define critical tasks that should stop automation on failure
    const criticalTasks = ['Login', 'Navigate to TikTok'];
    
    return criticalTasks.some(critical => 
      task.name.toLowerCase().includes(critical.toLowerCase())
    );
  }

  /**
   * Get current task name
   */
  getCurrentTaskName(): string {
    if (this.currentState.currentTaskIndex < this.tasks.length) {
      return this.tasks[this.currentState.currentTaskIndex].name;
    }
    return 'No current task';
  }

  /**
   * Get task by ID
   */
  getTaskById(taskId: string): AutomationTask | undefined {
    return this.tasks.find(task => task.id === taskId);
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: AutomationTask['status'], error?: string): Promise<void> {
    const task = this.getTaskById(taskId);
    if (task) {
      task.status = status;
      if (error) {
        task.error = error;
      }
      await this.saveState();
    }
  }
}
