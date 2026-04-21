package gen

import (
	context "context"

	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
)

type TransactionServiceClient interface {
	ProcessTransaction(ctx context.Context, in *TransactionRequest, opts ...grpc.CallOption) (*TransactionResponse, error)
}

type transactionServiceClient struct {
	cc grpc.ClientConnInterface
}

func NewTransactionServiceClient(cc grpc.ClientConnInterface) TransactionServiceClient {
	return &transactionServiceClient{cc}
}

func (c *transactionServiceClient) ProcessTransaction(ctx context.Context, in *TransactionRequest, opts ...grpc.CallOption) (*TransactionResponse, error) {
	out := new(TransactionResponse)
	err := c.cc.Invoke(ctx, "/payment.TransactionService/ProcessTransaction", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

type TransactionServiceServer interface {
	ProcessTransaction(context.Context, *TransactionRequest) (*TransactionResponse, error)
	mustEmbedUnimplementedTransactionServiceServer()
}

type UnimplementedTransactionServiceServer struct{}

func (UnimplementedTransactionServiceServer) ProcessTransaction(context.Context, *TransactionRequest) (*TransactionResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method ProcessTransaction not implemented")
}
func (UnimplementedTransactionServiceServer) mustEmbedUnimplementedTransactionServiceServer() {}

type UnsafeTransactionServiceServer interface {
	mustEmbedUnimplementedTransactionServiceServer()
}

func RegisterTransactionServiceServer(s grpc.ServiceRegistrar, srv TransactionServiceServer) {
	s.RegisterService(&TransactionService_ServiceDesc, srv)
}

func _TransactionService_ProcessTransaction_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(TransactionRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(TransactionServiceServer).ProcessTransaction(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/payment.TransactionService/ProcessTransaction",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(TransactionServiceServer).ProcessTransaction(ctx, req.(*TransactionRequest))
	}
	return interceptor(ctx, in, info, handler)
}

var TransactionService_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "payment.TransactionService",
	HandlerType: (*TransactionServiceServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "ProcessTransaction",
			Handler:    _TransactionService_ProcessTransaction_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "proto/payment.proto",
}
