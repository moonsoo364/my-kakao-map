<template>
  <div>
    <select v-model="level" @change="updateLevel">
      <option v-for="l in levels" :key="l" :value="l">Level {{ l }}</option>
    </select>
    <div id="map" style="width:100%; height:400px;"></div>
    <!-- 주소 표시 영역 -->
    <div style="margin-top:10px;">
      <div>도로명 주소: {{ roadAddress }}</div>
      <div>지번 주소: {{ address }}</div>
    </div>
  </div>
</template>

<script>
import markerImg from '@/assets/map/ic-marker-user.png';

export default {
  name: 'KakaoMap',
  data() {
    return {
      appKey: process.env.VUE_APP_API_KEY,
      pos: {
        latitude: 37.544761,
        longitude: 126.950337
      },
      kakaoMap: null,
      map: null, 
      level: 3,          
      levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      marker: null,
      address: '',        // 지번 주소
      roadAddress: '',    // 도로명 주소
    };
  },
  mounted() {
    if (!window.kakao) {
      const script = document.createElement('script');
      // 리버스 프록시는 정상 동작 안함
      // script.src = `/kakao/map?appkey=${this.appKey}&autoload=false`;
      script.src =  `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${this.appKey}&autoload=false&libraries=services`
      script.async = true;
      script.onload = () => {
        this.kakaoMap = window.kakao.maps;
        this.kakaoMap.load(() => {
          this.loadMap();
        });
      };
      document.head.appendChild(script);
    } else {
      this.kakaoMap = window.kakao.maps;
      this.kakaoMap.load(() => {
        this.loadMap();
      });
    }
  },
  methods: {
    //초기 지도 로드 메서드
    loadMap() {
      // console.log(this.kakaoMap);
      const container = document.getElementById('map');
      const options = {
        center: new this.kakaoMap.LatLng(this.pos.latitude, this.pos.longitude),
        level: this.level
      };
      this.map = new this.kakaoMap.Map(container, options);
      // this.markPoint();
      this.markWithImg();
      this.getAddressFromCoords(); 
    },
    //지도 축적 단계별로 변경
    updateLevel() {
      if (this.map) {
        this.map.setLevel(this.level);
      }
    },
    //카카오 기본 마커
    markPoint(){
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            position;
            // const lat = position.coords.latitude;
            // const lng = position.coords.longitude;
            const lat = this.pos.latitude;
            const lng = this.pos.longitude;
            const locPosition = new this.kakaoMap.LatLng(lat, lng);

            const marker = new this.kakaoMap.Marker({
              map: this.map,
              position: locPosition
            });

            const infowindow = new this.kakaoMap.InfoWindow({
              content: '<div style="padding:5px;">현재 위치</div>',
              removable: true
            });
            infowindow.open(this.map, marker);
            this.map.setCenter(locPosition);
          },
          () => {
            console.log('위치 정보를 가져올 수 없습니다.');
          }
        );
      }
    },
    // 커스텀 이미지 마커
    markWithImg(){

      // 기존에 마커가 있으면 null로 초기화
      if (this.marker) {
        this.marker.setMap(null);
      }
      const lat = this.pos.latitude;
      const lng = this.pos.longitude;
      // 해당 위도, 경도 위치에 마커 표시
      const locPosition = new this.kakaoMap.LatLng(lat,lng);

      const imageSrc = markerImg;
      const imageSize = new this.kakaoMap.Size(58,70)
      const imageOption = { offset: new this.kakaoMap.Point(29, 70) }; // 가로 절반(29), 세로 끝(70)
      
      const markerImage = new this.kakaoMap.MarkerImage(imageSrc, imageSize, imageOption);

      this.marker = new this.kakaoMap.Marker({
        map: this.map,
        position: locPosition,
        image: markerImage
      });

      this.map.setCenter(locPosition);
    },
   //현재 주소 정보 가져오기
  getAddressFromCoords() {
    const geocoder = new this.kakaoMap.services.Geocoder();
    const coord = new this.kakaoMap.LatLng(this.pos.latitude, this.pos.longitude);

    geocoder.coord2Address(coord.getLng(), coord.getLat(), (result, status) => {
      if (status === this.kakaoMap.services.Status.OK) {
        const roadAddr = result[0].road_address;
        const addr = result[0].address;
        this.roadAddress = roadAddr ? roadAddr.address_name : '도로명 주소가 없습니다.';
        this.address = addr ? addr.address_name : '지번 주소가 없습니다.';
        console.log('도로명 주소:', roadAddr);
        console.log('지번 주소:', addr);
      }
    });
  },
  }
};
</script>

<style scoped>
#map {
  width: 100%;
  height: 400px;
  margin-top: 10px;
}
select {
  font-size: 16px;
  padding: 4px;
}
</style>
