/**
 * Cloud storage placeholder for the current local-payslip build.
 *
 * Install the AWS SDK packages and replace these functions when payslips move
 * from `public/payslips` to private object storage.
 */

export async function uploadPayslip(_fileName: string, _body: Buffer): Promise<string> {
  throw new Error("S3 storage is not configured. Install AWS SDK packages and set AWS credentials before using it.");
}

export async function getPayslipSignedUrl(_key: string): Promise<string> {
  throw new Error("S3 storage is not configured. Install AWS SDK packages and set AWS credentials before using it.");
}
