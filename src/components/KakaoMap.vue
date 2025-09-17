<template>
  <div>
    <select v-model="level" @change="updateLevel">
      <option v-for="l in levels" :key="l" :value="l">Level {{ l }}</option>
    </select>
    <div id="map" ref="mapArea" style="width:100%; height:400px;"></div>
    <!-- 주소 표시 영역 -->
    <div style="margin-top:10px;">
      <div>도로명 주소: {{ roadAddress }}</div>
      <div>지번 주소: {{ address }}</div>
    </div>
  </div>
</template>

<script>
import startImg from '@/assets/map/ic-marker-user.png';
import endImg from '@/assets/map/ic-marker-store.png';

export default {
  name: 'KakaoMap',
  data() {
    return {
      appKey: process.env.VUE_APP_API_KEY,
      startPos: {// 서울 시청 좌표 
        latitude: 37.56669807755658,
        longitude: 126.97873152807972
      },
      endPos: {// 영등포 구청 좌표
        latitude: 37.52638881144293,
        longitude: 126.8962885955753
      },
      kakaoMap: null,
      map: null, 
      level: 3,          
      levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      startMarker: null,
      endMarker: null,
      address: '',        // 지번 주소
      roadAddress: '',    // 도로명 주소
      startLatLng: {},
      endLatLng: {},
    };
  },
  mounted() {
    this.loadMapScript();
  },
  methods: {
      loadMapScript(){
        if (!window.kakao) {
          const script = document.createElement('script');
          script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${this.appKey}&autoload=false&libraries=services`
          script.async = true;
          script.onload = () => {
            this.beforeLoadMap();
          };
          document.head.appendChild(script);
        } else {
          this.beforeLoadMap();
        }
    },
    beforeLoadMap(){
      this.kakaoMap = window.kakao.maps;
      this.kakaoMap.load(() => {
        this.loadMap();
      });
    },
    //초기 지도 로드 메서드
    loadMap() {
      const container = this.$refs.mapArea;
      this.startLatLng = this.setLatLng(this.startPos)
      this.endLatLng = this.setLatLng(this.endPos)
      const options = {
        center: this.startLatLng,
        level: this.level
      };
      this.map = new this.kakaoMap.Map(container, options);
      // this.initLatLng();
      this.markStart();
      this.markEnd();
      this.boundStartToEnd();
      this.getAddressFromCoords(); 
    },
     // 카카오 맵에서 타깃 표시
    markTarget (target) {
      if (target.marker) {
        target.marker.setMap(null)
      }

      const imageSrc = target.image
      const imageSize = new this.kakaoMap.Size(58, 70)
      const imageOption = { offset: new this.kakaoMap.Point(29, 70) } // 가로 절반(29), 세로 끝(70)

      const markerImage = new this.kakaoMap.MarkerImage(imageSrc, imageSize, imageOption)
      target.marker = new this.kakaoMap.Marker({
        map: this.map,
        position: target.position,
        image: markerImage
      })
    },
    // 시작 위치 이미지로 마커 표시
    markStart(){
      const target = {
        marker: this.startMarker,
        position: this.startLatLng,
        image: startImg
      }
      console.log(target);
      this.markTarget(target)
      // this.map.setCenter(this.startLatLng);
    },
    // 종료 위치 이미지로 마커 표시
    markEnd (){
      const target = {
        marker: this.endMarker,
        position: this.endLatLng,
        image: endImg
      }
      this.markTarget(target)
      // this.map.setCenter(this.endLatLng);
    },
    //현재 주소 정보 가져오기
    getAddressFromCoords() {
      const geocoder = new this.kakaoMap.services.Geocoder();
      geocoder.coord2Address(this.startLatLng.getLng(), this.startLatLng.getLat(), (result, status) => {
        if (status === this.kakaoMap.services.Status.OK) {
          const roadAddr = result[0].road_address;
          const addr = result[0].address;
          this.roadAddress = roadAddr ? roadAddr.address_name : '도로명 주소가 없습니다.';
          this.address = addr ? addr.address_name : '지번 주소가 없습니다.';
          // console.log('도로명 주소:', roadAddr);
          // console.log('지번 주소:', addr);
        }
      });
    },
    //카카오 기본 마커
    markPoint(){
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            position;
            // const lat = position.coords.latitude;
            // const lng = position.coords.longitude;
            const lat = this.startPos.latitude;
            const lng = this.startPos.longitude;
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
    // 시작 위치와 종료 위치 마커 표시
    boundStartToEnd () {
      const bounds = new this.kakaoMap.LatLngBounds()
      bounds.extend(this.startLatLng)
      bounds.extend(this.endLatLng)
      this.map.setBounds(bounds)
    },
    // 위, 경도 값으로 로 카카오 맵 위경도 객체 생성
    setLatLng(latLat) {
      return new this.kakaoMap.LatLng(latLat.latitude, latLat.longitude);
    },
        //지도 축적 단계별로 변경
    updateLevel() {
      if (this.map) {
        this.map.setLevel(this.level);
      }
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
