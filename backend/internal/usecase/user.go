package usecase

import (
	"context"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/m4rk1sov/ecommerce/internal/entity"

	"go.mongodb.org/mongo-driver/v2/bson"
	"golang.org/x/crypto/bcrypt"
)

type UserUseCase struct {
	repo      UserRepository
	jwtSecret string
	jwtExpiry time.Duration
}

func NewUserUseCase(repo UserRepository, sessionRepo interface{}, jwtSecret string, jwtExpiry time.Duration) *UserUseCase {
	return &UserUseCase{
		repo:      repo,
		jwtSecret: jwtSecret,
		jwtExpiry: jwtExpiry,
	}
}

func (uc *UserUseCase) Register(ctx context.Context, email, username, password, firstName, lastName string) (*entity.User, string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}

	user := &entity.User{
		Email:        email,
		Username:     username,
		PasswordHash: string(hashedPassword),
		FirstName:    firstName,
		LastName:     lastName,
		Preferences:  entity.UserPreferences{Categories: []string{}, PriceRange: entity.PriceRange{}},
	}

	if err := uc.repo.Create(ctx, user); err != nil {
		return nil, "", err
	}

	token, err := uc.generateToken(user.ID)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (uc *UserUseCase) Login(ctx context.Context, email, password string) (*entity.User, string, error) {
	user, err := uc.repo.GetByEmail(ctx, email)
	if err != nil {
		return nil, "", err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, "", err
	}

	token, err := uc.generateToken(user.ID)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (uc *UserUseCase) GetByID(ctx context.Context, id bson.ObjectID) (*entity.User, error) {
	return uc.repo.GetByID(ctx, id)
}

func (uc *UserUseCase) Update(ctx context.Context, user *entity.User) error {
	return uc.repo.Update(ctx, user)
}

func (uc *UserUseCase) generateToken(userID bson.ObjectID) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID.Hex(),
		"exp":     time.Now().Add(uc.jwtExpiry).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(uc.jwtSecret))
}
