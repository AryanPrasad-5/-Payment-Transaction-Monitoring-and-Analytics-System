package grpcclient
import (
	"context"
	"fmt"
	"log"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/status"

	pb "payment-monitor/proto/gen"
)

type Client struct {
	conn   *grpc.ClientConn
	client pb.TransactionServiceClient
}
type Result struct {
	Message string
	Success bool
}

func NewClient(address string) (*Client, error) {
	log.Printf("[gRPC] Connecting to %s ...", address)
	conn, err := grpc.Dial(
		address,
		grpc.WithTransportCredentials(insecure.NewCredentials()), 
		grpc.WithBlock(),                                          
		grpc.WithTimeout(5*time.Second),                           
	)
	if err != nil {
		return nil, fmt.Errorf("gRPC dial failed for address %q: %w", address, err)
	}

	log.Printf("[gRPC] Connected to %s ", address)

	return &Client{
		conn:   conn,
		client: pb.NewTransactionServiceClient(conn), 
	}, nil
}

func (c *Client) Close() {
	if c.conn != nil {
		c.conn.Close()
		log.Println("[gRPC] Connection closed")
	}
}
func (c *Client) SendTransaction(
	transactionID string,
	merchantID    string,
	amount        float64,
	status_       string,
	paymentMethod string,
) (*Result, error) {

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel() 
	req := &pb.TransactionRequest{
		TransactionId: transactionID,
		MerchantId:    merchantID,
		Amount:        amount,
		Status:        status_,
		PaymentMethod: paymentMethod,
	}

	log.Printf("[gRPC] → SendTransaction | txn_id=%s merchant=%s amount=%.2f",
		transactionID, merchantID, amount)
	resp, err := c.client.ProcessTransaction(ctx, req)
	if err != nil {
		return nil, translateError(err)
	}

	log.Printf("[gRPC] ← Response | success=%v message=%q", resp.GetSuccess(), resp.GetMessage())
	return &Result{
		Message: resp.GetMessage(),
		Success: resp.GetSuccess(),
	}, nil
}

func translateError(err error) error {
	st, ok := status.FromError(err)
	if !ok {
		return fmt.Errorf("gRPC call failed (non-status error): %w", err)
	}

	switch st.Code() {
	case codes.DeadlineExceeded:
		return fmt.Errorf("gRPC timeout: processor took too long to respond")
	case codes.Unavailable:
		return fmt.Errorf("gRPC unavailable: transaction processor is down")
	case codes.InvalidArgument:
		return fmt.Errorf("gRPC rejected request: %s", st.Message())
	case codes.Internal:
		return fmt.Errorf("gRPC internal server error: %s", st.Message())
	default:
		return fmt.Errorf("gRPC error [%s]: %s", st.Code(), st.Message())
	}
}
