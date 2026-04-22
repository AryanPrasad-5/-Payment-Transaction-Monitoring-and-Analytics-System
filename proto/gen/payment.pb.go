
package gen

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
	unsafe "unsafe"
)

const (
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type TransactionRequest struct {
	state         protoimpl.MessageState `protogen:"open.v1"`
	TransactionId string                 `protobuf:"bytes,1,opt,name=transaction_id,json=transactionId,proto3" json:"transaction_id,omitempty"`
	MerchantId    string                 `protobuf:"bytes,2,opt,name=merchant_id,json=merchantId,proto3" json:"merchant_id,omitempty"`
	Amount        float64                `protobuf:"fixed64,3,opt,name=amount,proto3" json:"amount,omitempty"`
	Status        string                 `protobuf:"bytes,4,opt,name=status,proto3" json:"status,omitempty"`
	PaymentMethod string                 `protobuf:"bytes,5,opt,name=payment_method,json=paymentMethod,proto3" json:"payment_method,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *TransactionRequest) Reset() {
	*x = TransactionRequest{}
	mi := &file_proto_payment_proto_msgTypes[0]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *TransactionRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*TransactionRequest) ProtoMessage() {}

func (x *TransactionRequest) ProtoReflect() protoreflect.Message {
	mi := &file_proto_payment_proto_msgTypes[0]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

func (*TransactionRequest) Descriptor() ([]byte, []int) {
	return file_proto_payment_proto_rawDescGZIP(), []int{0}
}

func (x *TransactionRequest) GetTransactionId() string {
	if x != nil {
		return x.TransactionId
	}
	return ""
}

func (x *TransactionRequest) GetMerchantId() string {
	if x != nil {
		return x.MerchantId
	}
	return ""
}

func (x *TransactionRequest) GetAmount() float64 {
	if x != nil {
		return x.Amount
	}
	return 0
}

func (x *TransactionRequest) GetStatus() string {
	if x != nil {
		return x.Status
	}
	return ""
}

func (x *TransactionRequest) GetPaymentMethod() string {
	if x != nil {
		return x.PaymentMethod
	}
	return ""
}

type TransactionResponse struct {
	state         protoimpl.MessageState `protogen:"open.v1"`
	Success       bool                   `protobuf:"varint,1,opt,name=success,proto3" json:"success,omitempty"`
	Message       string                 `protobuf:"bytes,2,opt,name=message,proto3" json:"message,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *TransactionResponse) Reset() {
	*x = TransactionResponse{}
	mi := &file_proto_payment_proto_msgTypes[1]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *TransactionResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*TransactionResponse) ProtoMessage() {}

func (x *TransactionResponse) ProtoReflect() protoreflect.Message {
	mi := &file_proto_payment_proto_msgTypes[1]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

func (*TransactionResponse) Descriptor() ([]byte, []int) {
	return file_proto_payment_proto_rawDescGZIP(), []int{1}
}

func (x *TransactionResponse) GetSuccess() bool {
	if x != nil {
		return x.Success
	}
	return false
}

func (x *TransactionResponse) GetMessage() string {
	if x != nil {
		return x.Message
	}
	return ""
}

var File_proto_payment_proto protoreflect.FileDescriptor

const file_proto_payment_proto_rawDesc = "" +
	"\n" +
	"\x13proto/payment.proto\x12\apayment\"\xb3\x01\n" +
	"\x12TransactionRequest\x12%\n" +
	"\x0etransaction_id\x18\x01 \x01(\tR\rtransactionId\x12\x1f\n" +
	"\vmerchant_id\x18\x02 \x01(\tR\n" +
	"merchantId\x12\x16\n" +
	"\x06amount\x18\x03 \x01(\x01R\x06amount\x12\x16\n" +
	"\x06status\x18\x04 \x01(\tR\x06status\x12%\n" +
	"\x0epayment_method\x18\x05 \x01(\tR\rpaymentMethod\"I\n" +
	"\x13TransactionResponse\x12\x18\n" +
	"\asuccess\x18\x01 \x01(\bR\asuccess\x12\x18\n" +
	"\amessage\x18\x02 \x01(\tR\amessage2e\n" +
	"\x12TransactionService\x12O\n" +
	"\x12ProcessTransaction\x12\x1b.payment.TransactionRequest\x1a\x1c.payment.TransactionResponseB\x1bZ\x19payment-monitor/proto/genb\x06proto3"

var (
	file_proto_payment_proto_rawDescOnce sync.Once
	file_proto_payment_proto_rawDescData []byte
)

func file_proto_payment_proto_rawDescGZIP() []byte {
	file_proto_payment_proto_rawDescOnce.Do(func() {
		file_proto_payment_proto_rawDescData = protoimpl.X.CompressGZIP(unsafe.Slice(unsafe.StringData(file_proto_payment_proto_rawDesc), len(file_proto_payment_proto_rawDesc)))
	})
	return file_proto_payment_proto_rawDescData
}

var file_proto_payment_proto_msgTypes = make([]protoimpl.MessageInfo, 2)
var file_proto_payment_proto_goTypes = []any{
	(*TransactionRequest)(nil),
	(*TransactionResponse)(nil),
}
var file_proto_payment_proto_depIdxs = []int32{
	0,
	1,
	1,
	0,
	0,
	0,
	0,
}

func init() { file_proto_payment_proto_init() }
func file_proto_payment_proto_init() {
	if File_proto_payment_proto != nil {
		return
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: unsafe.Slice(unsafe.StringData(file_proto_payment_proto_rawDesc), len(file_proto_payment_proto_rawDesc)),
			NumEnums:      0,
			NumMessages:   2,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_proto_payment_proto_goTypes,
		DependencyIndexes: file_proto_payment_proto_depIdxs,
		MessageInfos:      file_proto_payment_proto_msgTypes,
	}.Build()
	File_proto_payment_proto = out.File
	file_proto_payment_proto_goTypes = nil
	file_proto_payment_proto_depIdxs = nil
}
