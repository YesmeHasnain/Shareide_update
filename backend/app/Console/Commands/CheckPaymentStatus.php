<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BankAlfalahService;

class CheckPaymentStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payment:check {order_id : The Order ID to check}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check Bank Alfalah payment status via IPN API';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $orderId = $this->argument('order_id');

        $this->info("Checking payment status for Order ID: {$orderId}");
        $this->newLine();

        try {
            $service = new BankAlfalahService();
            $result = $service->checkTransactionStatus($orderId);

            if ($result['success']) {
                $this->info('✅ Transaction Found!');
                $this->newLine();

                $this->table(
                    ['Field', 'Value'],
                    [
                        ['Order ID', $result['data']['OrderId'] ?? $orderId],
                        ['Status', $result['data']['TransactionStatus'] ?? 'N/A'],
                        ['Amount', 'Rs. ' . ($result['data']['TransactionAmount'] ?? 'N/A')],
                        ['Payment Method', $result['data']['PaymentMethod'] ?? 'N/A'],
                        ['Transaction Date', $result['data']['TransactionDate'] ?? 'N/A'],
                        ['Response Code', $result['data']['ResponseCode'] ?? 'N/A'],
                        ['Response Message', $result['data']['ResponseMessage'] ?? 'N/A'],
                    ]
                );
            } else {
                $this->error('❌ Transaction not found or failed');
                $this->warn('Message: ' . ($result['message'] ?? 'Unknown error'));
            }

            // Show raw response for debugging
            $this->newLine();
            $this->info('Raw API Response:');
            $this->line(json_encode($result, JSON_PRETTY_PRINT));

        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
