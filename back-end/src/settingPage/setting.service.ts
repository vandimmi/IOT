import { Injectable, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument } from './schema/setting.schema';


@Injectable()
export class SettingService {
  constructor(@InjectModel(Setting.name) private settingModel: Model<SettingDocument>) {}

  async getThresholds(@Query('limit') limit: number): Promise<Setting[]> {
    console.log('[SettingService] Fetching thresholds');
    if (await this.settingModel.countDocuments() === 0) {
      // If no settings exist, create default settings
      const defaultSettings: Setting = {
        MQ2: 500,
        MQ7: 1000,
        MQ135: 300,
        temp: 50,
        wifiSSID: '',
        wifiPassword: '',
      };
      await this.settingModel.create(defaultSettings);
    }
    return await this.settingModel.find().sort({ _id: -1 }).limit(limit).exec();
  }

  async createThresholds(body: any): Promise<void> {
    console.log('[SettingService] Creating thresholds with data:', body);
    const newSettings = new this.settingModel(body);
    await newSettings.save();
  }

  async updateThresholds(body: any): Promise<void> {
    console.log('[SettingService] Updating thresholds with data:', body);
    await this.settingModel.updateOne({}, body, { upsert: true }).exec();
  }
}