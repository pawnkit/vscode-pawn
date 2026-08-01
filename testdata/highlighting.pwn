#include <open.mp>

#if defined FEATURE_ENABLED
    #define ACTIVE_COLOUR 0x33CCFFFF
#define SCALE(%value) ((%value) * 2)
#else
    #endinput
#endif

#if !defined(FEATURE_DISABLED)
    #define FEATURE_LEVEL 2
#endif

enum PlayerState
{
    PLAYER_STATE_IDLE,
    PLAYER_STATE_READY
};

hook OnGameModeInit()
{
    foreach (new playerid : Player)
    {
        SendClientMessage(playerid, ACTIVE_COLOUR, "Ready");
    }
    return 1;
}
