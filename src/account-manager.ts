import * as fs from 'fs';
import * as path from 'path';
import { Account } from './interfaces';

/**
 * Manages account operations
 */
export class AccountManager {
  /**
   * Read accounts from environment variables or file
   */
  static async readAccounts(): Promise<Account[]> {
    try {
      // Ưu tiên sử dụng environment variables (Railway/Production)
      const envAccounts = process.env.ACCOUNTS;
      if (envAccounts && envAccounts.trim()) {
        console.log('🔐 Sử dụng accounts từ environment variables (Railway/Production)');
        
        // Tách theo dấu ; và lọc các giá trị trống
        const accounts = envAccounts.split(";").map(a => a.trim()).filter(Boolean);
        
        if (accounts.length === 0) {
          throw new Error("❌ Không có tài khoản hợp lệ trong biến môi trường ACCOUNTS");
        }
        
        return accounts.map(account => {
          const [username, password] = account.split(':');
          if (!username || !password) {
            throw new Error(`❌ Format tài khoản không hợp lệ: ${account}. Sử dụng format: username:password`);
          }
          return { username: username.trim(), password: password.trim() };
        });
      }
      
      // Fallback về file accounts.txt (Local development)
      console.log('📁 Sử dụng file accounts.txt (Local development)');
      const accountsPath = path.join(__dirname, '..', 'accounts.txt');
      
      const data = fs.readFileSync(accountsPath, 'utf8');
      const lines = data.trim().split('\n').filter(line => line.trim() && !line.startsWith('#'));
      
      if (lines.length === 0) {
        throw new Error("❌ File accounts.txt trống hoặc không có tài khoản hợp lệ");
      }
      
      return lines.map(line => {
        const [username, password] = line.split(':');
        if (!username || !password) {
          throw new Error(`❌ Format tài khoản không hợp lệ: ${line}. Sử dụng format: username:password`);
        }
        return { username: username.trim(), password: password.trim() };
      });
      
    } catch (error) {
      console.error('❌ Lỗi khi đọc accounts:', error);
      throw error;
    }
  }

  /**
   * Get first account from the list
   */
  static async getFirstAccount(): Promise<Account> {
    const accounts = await this.readAccounts();
    
    if (accounts.length === 0) {
      throw new Error('Không có tài khoản nào trong file accounts.txt');
    }
    
    return accounts[0];
  }

  /**
   * Validate account format
   */
  static validateAccount(account: Account): boolean {
    return !!(account.username && account.password);
  }
}

