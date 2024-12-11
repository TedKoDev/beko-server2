// update-user-profile.dto.ts
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateNotificationSettingsDto {
  //  // 앱 알림 설정 관련 필드
  // notification_benefit Boolean         @default(true)   // 혜택 및 이벤트 알림
  // notification_community Boolean       @default(true)   // 커뮤니티 활동 알림

  @IsBoolean()
  @IsNotEmpty()
  notification_benefit: boolean;

  @IsBoolean()
  @IsNotEmpty()
  notification_community: boolean;
}
