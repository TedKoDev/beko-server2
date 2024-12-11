import { PrismaService } from '@/prisma';
import { ROLE } from '@/types/v1/enums/role.enum';
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateReportDto } from './dto/create-report.dto';
import {
  PaginationQueryDto,
  ReportSortOrder,
} from './dto/pagination-query.dto';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  // 신고 생성
  async createReport(createReportDto: CreateReportDto, reporterId: number) {
    console.log('createReportDto', createReportDto);
    console.log('reporterId', reporterId);

    // 1. 신고자와 신고 대상이 같은 경우 체크
    if (reporterId === createReportDto.reported_user_id) {
      throw new BadRequestException('자기 자신을 신고할 수 없습니다.');
    }

    // 2. 신고 대상 사용자 확인
    let reportedUserId = createReportDto.reported_user_id;
    console.log('reportedUserId', reportedUserId);
    // / 3. targetType이 'GENERAL'인 경우 ADMIN 사용자 찾기
    if (createReportDto.target_type === 'GENERAL') {
      const adminUser = await this.prisma.users.findFirst({
        where: { role: ROLE.ADMIN },
      });
      console.log('adminUser');

      if (adminUser) {
        reportedUserId = adminUser.user_id; // ADMIN 사용자 ID로 설정
      } else {
        throw new NotFoundException('신고를 처리할 ADMIN 사용자가 없습니다.');
      }
    }

    // // 5. 이미 동일한 신고가 있는지 확인
    // const existingReport = await this.prisma.report.findFirst({
    //   where: {
    //     reporter_user_id: reporterId,
    //     reported_user_id: reportedUserId,
    //     target_type: createReportDto.target_type,
    //     target_id: createReportDto.target_id,
    //     status: 'PENDING',
    //   },
    // });

    // if (existingReport) {
    //   throw new BadRequestException('이미 동일한 신고가 접수되어 있습니다.');
    // }

    // 6. 신고 생성
    const report = await this.prisma.report.create({
      data: {
        target_type: createReportDto.target_type,
        target_id: createReportDto.target_id,
        reported_user_id: reportedUserId, // ADMIN 사용자 ID 사용
        reporter_user_id: reporterId,
        reason: createReportDto.reason,
        status: 'PENDING',
      },
    });

    return {
      message: '신고가 접수되었습니다.',
      report_id: report.report_id,
    };
  }
  catch(error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new InternalServerErrorException('신고 처리 중 오류가 발생했습니다.');
  }

  // 리포트 리스트 조회

  // 리포트 리스트 조회
  async getReports(paginationQuery: PaginationQueryDto) {
    const { page, limit, search, sortOrder } = paginationQuery;
    const skip = (page - 1) * limit;

    // 기본적으로 최신 순 정렬, 사용자가 정렬 순서를 지정한 경우 적용
    const orderBy: Prisma.reportOrderByWithRelationInput =
      sortOrder === ReportSortOrder.OLDEST
        ? { created_at: 'asc' }
        : { created_at: 'desc' };

    // 검색 조건 적용
    const where: Prisma.reportWhereInput = search
      ? {
          OR: [
            {
              reason: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
            {
              reported_user: {
                username: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
            {
              reporter_user: {
                username: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          ],
        }
      : {};

    const [reports, totalCount] = await Promise.all([
      this.prisma.report.findMany({
        skip,
        take: limit,
        orderBy,
        where,
        include: {
          reported_user: { select: { username: true, email: true } },
          reporter_user: { select: { username: true, email: true } },
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data: reports,
      total: totalCount,
      page,
      limit,
    };
  }

  // 신고 상세 조회
  async getReportById(reportId: number) {
    return this.prisma.report.findUnique({
      where: { report_id: reportId },
      include: {
        reported_user: { select: { username: true, email: true } },
        reporter_user: { select: { username: true, email: true } },
        resolved_by: { select: { username: true } },
      },
    });
  }

  // 신고 상태 업데이트 (관리자가 신고를 처리)
  async updateReportStatus(
    reportId: number,
    status: 'RESOLVED' | 'REJECTED',
    resolvedByUserId: number,
  ) {
    return this.prisma.report.update({
      where: { report_id: reportId },
      data: {
        status,
        resolved_at: new Date(),
        resolved_by_user_id: resolvedByUserId,
      },
    });
  }
}
