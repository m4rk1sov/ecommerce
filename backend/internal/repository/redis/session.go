package redis

import (
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"
)

const sessionTTL = 24 * time.Hour

type SessionRepository struct {
	client *redis.Client
}

type Session struct {
	UserID    string    `json:"user_id"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

func NewSessionRepository(client *redis.Client) *SessionRepository {
	return &SessionRepository{
		client: client,
	}
}

func (r *SessionRepository) Create(ctx context.Context, sessionID string, session *Session) error {
	session.CreatedAt = time.Now()

	data, err := json.Marshal(session)
	if err != nil {
		return err
	}

	return r.client.Set(ctx, UserSessionKey(sessionID), data, sessionTTL).Err()
}

func (r *SessionRepository) Get(ctx context.Context, sessionID string) (*Session, error) {
	data, err := r.client.Get(ctx, UserSessionKey(sessionID)).Result()
	if err != nil {
		return nil, err
	}

	var session Session
	if err := json.Unmarshal([]byte(data), &session); err != nil {
		return nil, err
	}

	return &session, nil
}

func (r *SessionRepository) Delete(ctx context.Context, sessionID string) error {
	return r.client.Del(ctx, UserSessionKey(sessionID)).Err()
}

func (r *SessionRepository) Refresh(ctx context.Context, sessionID string) error {
	return r.client.Expire(ctx, UserSessionKey(sessionID), sessionTTL).Err()
}
