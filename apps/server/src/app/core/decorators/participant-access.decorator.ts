import { SetMetadata } from '@nestjs/common';


export const ALLOW_PARTICIPANT_ACCESS_KEY = 'allowParticipantAccess';
export const ParticipantAccess = () => SetMetadata( ALLOW_PARTICIPANT_ACCESS_KEY, true );
