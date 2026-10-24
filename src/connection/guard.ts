let joined = false, control = true;
export const canControlPet = () => control;
export const isSharingPet = () => joined;
export function setSharedControl(active: boolean, controller: boolean) { joined = active; control = !active || controller; }
