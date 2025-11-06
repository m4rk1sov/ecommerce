package v1

type V1 struct {
	t usecase.Ecommerce
	l logger.Interface
	v *validator.Validate
}
