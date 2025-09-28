-- Add group invitations table

-- Create the group_invitations table
CREATE TABLE IF NOT EXISTS group_invitations (
    invitation_id SERIAL PRIMARY KEY,
    group_id INT NOT NULL REFERENCES groups(group_id),
    inviter_id INT NOT NULL REFERENCES users(user_id),
    invitee_id INT NOT NULL REFERENCES users(user_id),
    invitation_email VARCHAR(255),
    token VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    UNIQUE (group_id, invitee_id, status) 
);

-- Create indexes
CREATE INDEX idx_invitations_group ON group_invitations(group_id);
CREATE INDEX idx_invitations_invitee ON group_invitations(invitee_id);
CREATE INDEX idx_invitations_status ON group_invitations(status);

COMMENT ON TABLE group_invitations IS 'Stores invitations to join farmer groups';