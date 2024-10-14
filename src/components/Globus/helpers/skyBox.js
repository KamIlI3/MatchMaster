import * as THREE from 'three';

import space_right from '../../../assets/images/space_right.png';
import space_left from '../../../assets/images/space_left.png';
import space_top from '../../../assets/images/space_top.png';
import space_bot from '../../../assets/images/space_bot.png';
import space_back from '../../../assets/images/space_back.png';
import space_front from '../../../assets/images/space_front.png';


export const createSkyBox = () => {
    return new THREE.CubeTextureLoader().load([
        space_right,
        space_left,
        space_top,
        space_bot,
        space_front,
        space_back,
    ]);
};